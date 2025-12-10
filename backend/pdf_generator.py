from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, Image
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from datetime import datetime
import os
from typing import Optional


def generate_vehicle_receipt(
    vehiculo: dict,
    propietario: dict,
    defectos: list,
    output_path: str,
    logo_path: Optional[str] = None
) -> str:
    """
    Genera un PDF de comprobante para el ingreso de un vehículo al taller
    
    Args:
        vehiculo: Datos del vehículo
        propietario: Datos del propietario
        defectos: Lista de defectos detectados
        output_path: Ruta donde guardar el PDF
        logo_path: Ruta opcional al logo del taller
        
    Returns:
        Ruta del archivo PDF generado
    """
    doc = SimpleDocTemplate(output_path, pagesize=letter)
    story = []
    styles = getSampleStyleSheet()
    
    # Estilos personalizados
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=24,
        textColor=colors.HexColor('#1a365d'),
        spaceAfter=30,
        alignment=TA_CENTER
    )
    
    heading_style = ParagraphStyle(
        'CustomHeading',
        parent=styles['Heading2'],
        fontSize=14,
        textColor=colors.HexColor('#2d3748'),
        spaceAfter=12,
        spaceBefore=12
    )
    
    # Logo (si existe)
    if logo_path and os.path.exists(logo_path):
        logo = Image(logo_path, width=2*inch, height=1*inch)
        story.append(logo)
        story.append(Spacer(1, 0.2*inch))
    
    # Título
    title = Paragraph("COMPROBANTE DE INGRESO DE VEHÍCULO", title_style)
    story.append(title)
    story.append(Spacer(1, 0.3*inch))
    
    # Información del taller y fecha
    fecha_actual = datetime.now().strftime("%d/%m/%Y %H:%M")
    info_taller = f"""
    <para alignment="center">
    <b>Fecha de Ingreso:</b> {fecha_actual}<br/>
    <b>Folio:</b> {vehiculo.get('id', 'N/A')}<br/>
    </para>
    """
    story.append(Paragraph(info_taller, styles['Normal']))
    story.append(Spacer(1, 0.3*inch))
    
    # Datos del Propietario
    story.append(Paragraph("DATOS DEL PROPIETARIO", heading_style))
    propietario_data = [
        ["Nombre Completo:", propietario.get('nombre_completo', 'N/A')],
        ["Teléfono:", propietario.get('telefono', 'N/A')]
    ]
    propietario_table = Table(propietario_data, colWidths=[2*inch, 4.5*inch])
    propietario_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#e2e8f0')),
        ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
        ('ALIGN', (0, 0), (0, -1), 'RIGHT'),
        ('ALIGN', (1, 0), (1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('FONTNAME', (1, 0), (1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey)
    ]))
    story.append(propietario_table)
    story.append(Spacer(1, 0.2*inch))
    
    # Datos del Vehículo
    story.append(Paragraph("DATOS DEL VEHÍCULO", heading_style))
    vehiculo_data = [
        ["Marca:", vehiculo.get('marca', 'N/A')],
        ["Modelo:", vehiculo.get('modelo', 'N/A')],
        ["Año:", str(vehiculo.get('anio', 'N/A'))],
        ["Color:", vehiculo.get('color', 'N/A')],
        ["Placas:", vehiculo.get('placas', 'N/A')]
    ]
    vehiculo_table = Table(vehiculo_data, colWidths=[2*inch, 4.5*inch])
    vehiculo_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#e2e8f0')),
        ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
        ('ALIGN', (0, 0), (0, -1), 'RIGHT'),
        ('ALIGN', (1, 0), (1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('FONTNAME', (1, 0), (1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey)
    ]))
    story.append(vehiculo_table)
    story.append(Spacer(1, 0.2*inch))
    
    # Problema de Ingreso
    story.append(Paragraph("MOTIVO DE INGRESO", heading_style))
    problema_text = vehiculo.get('problema_ingreso', 'N/A')
    problema_para = Paragraph(problema_text, styles['Normal'])
    problema_table = Table([[problema_para]], colWidths=[6.5*inch])
    problema_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#fffaf0')),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
        ('TOPPADDING', (0, 0), (-1, -1), 10),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 10),
        ('LEFTPADDING', (0, 0), (-1, -1), 10),
        ('RIGHTPADDING', (0, 0), (-1, -1), 10)
    ]))
    story.append(problema_table)
    story.append(Spacer(1, 0.2*inch))
    
    # Defectos Estéticos
    story.append(Paragraph("DEFECTOS Y DAÑOS ESTÉTICOS EXISTENTES", heading_style))
    if defectos and len(defectos) > 0:
        defectos_data = [["#", "Tipo", "Ubicación", "Descripción", "Detección"]]
        for idx, defecto in enumerate(defectos, 1):
            deteccion = "IA" if defecto.get('detectado_automaticamente', 0) == 1 else "Manual"
            defectos_data.append([
                str(idx),
                defecto.get('tipo', 'N/A'),
                defecto.get('ubicacion', 'N/A')[:20],
                defecto.get('descripcion', 'N/A')[:40],
                deteccion
            ])
        
        defectos_table = Table(defectos_data, colWidths=[0.4*inch, 1*inch, 1.5*inch, 2.5*inch, 1*inch])
        defectos_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#2d3748')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 10),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.black),
            ('FONTSIZE', (0, 1), (-1, -1), 9),
            ('TOPPADDING', (0, 1), (-1, -1), 6),
            ('BOTTOMPADDING', (0, 1), (-1, -1), 6)
        ]))
        story.append(defectos_table)
    else:
        no_defectos = Paragraph("No se registraron defectos estéticos.", styles['Normal'])
        story.append(no_defectos)
    
    story.append(Spacer(1, 0.5*inch))
    
    # Sección de firmas
    story.append(Spacer(1, 0.5*inch))
    firmas_data = [
        ["_" * 40, "_" * 40],
        ["Firma del Cliente", "Firma del Taller"],
        ["", ""],
        [f"Nombre: {propietario.get('nombre_completo', '')}", "Nombre: _______________"]
    ]
    firmas_table = Table(firmas_data, colWidths=[3.25*inch, 3.25*inch])
    firmas_table.setStyle(TableStyle([
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 1), (-1, 1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('TOPPADDING', (0, 0), (-1, 0), 0),
        ('BOTTOMPADDING', (0, 1), (-1, 1), 20)
    ]))
    story.append(firmas_table)
    
    # Nota legal
    story.append(Spacer(1, 0.3*inch))
    nota_legal = """
    <para alignment="center" fontSize="8">
    <i>Este documento certifica el estado del vehículo al momento de su ingreso al taller.
    El cliente acepta que los defectos aquí registrados existían previo al servicio.</i>
    </para>
    """
    story.append(Paragraph(nota_legal, styles['Normal']))
    
    # Construir PDF
    doc.build(story)
    return output_path
