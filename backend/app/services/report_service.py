# backend/app/services/report_service.py
import pandas as pd
from datetime import datetime
import json
import os

async def generate_report(dataset_id, db, format="pdf"):
    """Generate comprehensive report"""
    
    # Get all data
    dataset = await db.datasets.find_one({"_id": __import__('bson').ObjectId(dataset_id)})
    profile = await db.dataset_profiles.find_one({"dataset_id": dataset_id})
    issues = await db.data_quality_issues.find({"dataset_id": dataset_id}).to_list(None)
    operations = await db.cleaning_operations.find({"dataset_id": dataset_id}).to_list(None)
    insights = await db.ai_insights.find_one({"dataset_id": dataset_id, "type": "insights"})
    
    report = {
        "title": "DataDoctor AI - Data Quality Report",
        "dataset_name": dataset.get("filename"),
        "generated_at": datetime.utcnow().isoformat(),
        "dataset_overview": {
            "rows": dataset.get("rows"),
            "columns": dataset.get("columns"),
            "uploaded": dataset.get("created_at").isoformat() if dataset.get("created_at") else None,
            "health_score": dataset.get("health_score")
        },
        "health_score_breakdown": dataset.get("health_details", {}),
        "issues_summary": {
            "total": len(issues),
            "by_severity": {},
            "by_type": {}
        },
        "cleaning_operations": len(operations),
        "insights": insights.get("key_findings", []) if insights else []
    }
    
    # Aggregate issues
    for issue in issues:
        severity = issue.get("severity", "unknown")
        issue_type = issue.get("type", "unknown")
        report["issues_summary"]["by_severity"][severity] = report["issues_summary"]["by_severity"].get(severity, 0) + 1
        report["issues_summary"]["by_type"][issue_type] = report["issues_summary"]["by_type"].get(issue_type, 0) + 1
    
    # Store report
    await db.reports.update_one(
        {"dataset_id": dataset_id},
        {"$set": report},
        upsert=True
    )
    
    # Generate file based on format
    if format == "csv":
        output_path = f"reports/{dataset_id}_report.csv"
        pd.DataFrame([report]).to_csv(output_path, index=False)
    elif format == "pdf":
        # Simple text-based PDF
        output_path = f"reports/{dataset_id}_report.pdf"
        from fpdf import FPDF
        pdf = FPDF()
        pdf.add_page()
        pdf.set_font("Arial", size=12)
        pdf.cell(200, 10, txt="DataDoctor AI Report", ln=True, align='C')
        pdf.cell(200, 10, txt=f"Dataset: {report['dataset_name']}", ln=True)
        pdf.cell(200, 10, txt=f"Health Score: {report['dataset_overview']['health_score']}", ln=True)
        pdf.output(output_path)
    else:
        output_path = f"reports/{dataset_id}_report.json"
        with open(output_path, 'w') as f:
            json.dump(report, f, default=str)
    
    return report

async def get_download_path(dataset_id, format, db):
    """Get download file path"""
    return f"reports/{dataset_id}_report.{format}"