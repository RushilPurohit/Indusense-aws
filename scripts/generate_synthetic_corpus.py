import os
import json

MANUALS_DIR = os.path.join(os.path.dirname(__file__), 'data', 'synthetic_manuals')
os.makedirs(MANUALS_DIR, exist_ok=True)

# 1. Spindle Cooling & HDF Manual
hdf_content = """INDUSENSE SYNTHETIC MAINTENANCE MANUAL
DOCUMENT ID: SYNTH-MAN-CNC-004
TITLE: Industrial Spindle Cooling Circuit & Thermal Dissipation Manual
STATUS: SYNTHETIC DATASET — RESEARCH FRAMEWORK ONLY

SECTION 1: SYSTEM OVERVIEW
The 5-axis high-speed milling spindle employs a closed-loop ethylene glycol cooling circuit 
rated for continuous duty up to 24,000 RPM. Auxiliary heat exchangers dissipate stator and 
bearing thermal losses into the ambient bay atmosphere.

SECTION 4.2: HEAT DISSIPATION FAILURE (HDF) DIAGNOSTIC PROCEDURE
Trigger Criteria:
- Air Temperature: Ambient sensor T_air
- Process Temperature: Stator jacket sensor T_proc
- Rotational Speed: Spindle encoder N_rpm

CRITICAL ANOMALY RULE:
When the temperature difference [T_proc - T_air] falls below 8.6 Kelvin while the rotational 
speed remains below 1380 RPM, the system is in Heat Dissipation Failure (HDF) condition. 
Under low rotational velocity, reduced fan blade forced convection leads to thermal saturation.

MANDATORY CORRECTIVE ACTIONS:
1. Immediately disengage spindle drive and lock out main 400V breaker.
2. Inspect auxiliary cooling fan CF-02 for mechanical binding or blade debris accumulation.
3. Remove and wash suction filter mesh SF-12 using neutral solvent.
4. Verify glycol coolant line flow rate exceeds nominal 4.2 L/min threshold.
5. Record inspection sign-off before restarting spindle sequence.
"""

# 2. Pneumatic Chuck Clamp (Deliberate Distractor)
distractor_content = """INDUSENSE SYNTHETIC MAINTENANCE MANUAL (DISTRACTOR CORPUS)
DOCUMENT ID: SYNTH-MAN-CHUCK-018
TITLE: Pneumatic Chuck Clamp Calibration & Pressure System Manual
STATUS: SYNTHETIC DISTRACTOR — SEMANTIC PROXIMITY FALLACY BENCHMARK

SECTION 2: WORKHOLDING PRESSURE EQUALIZATION
Pneumatic and hydraulic workpiece clamping fixtures maintain workpiece concentricity.
Ambient air pressure and low-velocity cycling require calibration checks.

SECTION 5.4: LOW-SPEED AIR PRESSURE REGULATION
When ambient air delta falls below threshold during low-speed tooling cycles, clamping force 
decay may occur. Technicians must inspect pneumatic line PL-04, adjust regulator valve RV-204, 
and recalibrate chuck hydraulic clamps to 45 bar before spindle restart.

NOTE: This procedure applies strictly to workpiece retention chucks and has NO relation 
to spindle motor stator cooling.
"""

# 3. PRONOSTIA Bearing Manual
bearing_content = """INDUSENSE SYNTHETIC MAINTENANCE MANUAL
DOCUMENT ID: SYNTH-MAN-BRG-024
TITLE: PRONOSTIA Roller Bearing Degradation & Lubrication Standards
STATUS: SYNTHETIC DATASET — RESEARCH FRAMEWORK ONLY

SECTION 3: ROLLER BEARING VIBRATION SIGNATURES
Outer race spalling manifests through repetitive shock pulses at Ball Pass Frequency Outer Race:
BPFO = (N_balls / 2) * (1 - (d_roller / D_pitch) * cos(contact_angle)) * shaft_frequency.
For benchmark speed 1800 RPM, BPFO modulates at 108.4 Hz.

SECTION 6.1: DEGRADATION THRESHOLDS & STAGE-3 SPALLING
Condition Criteria:
- Horizontal Vibration Kurtosis > 4.5
- Envelope Spectrum Modulation at 108 Hz > 14 dB
- Crest Factor > 4.0

ACTION PROTOCOL:
Denotes Stage-3 subsurface fatigue spalling. Immediately inspect grease contamination level. 
If metal particulates are identified on magnetic drain plug, schedule bearing cartridge replacement.
"""

# 4. Write text and minimal valid PDF files
def create_minimal_pdf(filename, title, content_text):
    # Create simple valid PDF 1.4 stream
    pdf_path = os.path.join(MANUALS_DIR, filename)
    txt_path = os.path.join(MANUALS_DIR, filename.replace('.pdf', '.txt'))
    
    with open(txt_path, 'w', encoding='utf-8') as f:
        f.write(content_text)
        
    # Write a clean binary PDF using raw PDF structures
    lines = content_text.split('\n')
    text_commands = []
    y = 750
    for line in lines[:40]:
        clean = line.replace('\\', '\\\\').replace('(', '\\(').replace(')', '\\)')
        text_commands.append(f"1 0 0 1 50 {y} Tm ({clean}) Tj")
        y -= 14
        if y < 60:
            break
    stream_content = "BT /F1 10 Tf\n" + "\n".join(text_commands) + "\nET"
    stream_len = len(stream_content.encode('utf-8'))
    
    pdf_bytes = f"""%PDF-1.4
1 0 obj <</Type /Catalog /Pages 2 0 R>> endobj
2 0 obj <</Type /Pages /Kids [3 0 R] /Count 1>> endobj
3 0 obj <</Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources <</Font <</F1 5 0 R>>>>>> endobj
4 0 obj <</Length {stream_len}>>
stream
{stream_content}
endstream
endobj
5 0 obj <</Type /Font /Subtype /Type1 /BaseFont /Helvetica>> endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000227 00000 n 
0000000300 00000 n 
trailer <</Size 6 /Root 1 0 R>>
startxref
370
%%EOF"""
    pdf_clean = pdf_bytes.replace('\u2014', '--').replace('\u2013', '-')
    with open(pdf_path, 'wb') as f:
        f.write(pdf_clean.encode('latin1', errors='replace'))

create_minimal_pdf('synthetic_spindle_cooling_manual.pdf', 'Spindle Cooling Manual', hdf_content)
create_minimal_pdf('synthetic_pneumatic_chuck_distractor.pdf', 'Pneumatic Chuck Manual', distractor_content)
create_minimal_pdf('synthetic_bearing_standards.pdf', 'Bearing Manual', bearing_content)

# 5. Labelled Synthetic Alignment Benchmark
benchmark = [
    {
        "id": "bench-001",
        "condition": {
            "asset_id": "CNC-M102",
            "fault": "Heat Dissipation Failure (HDF)",
            "telemetry": "Delta T = 8.1 K (< 8.6 K), Speed = 1320 rpm (< 1380 rpm)"
        },
        "candidate": {
            "doc_id": "SYNTH-MAN-CNC-004",
            "page": 42,
            "passage": "When the temperature difference [T_proc - T_air] falls below 8.6 Kelvin while the rotational speed remains below 1380 RPM, the system is in Heat Dissipation Failure (HDF). Inspect cooling fan CF-02 and clean filter mesh SF-12.",
            "component": "Spindle Cooling Circuit"
        },
        "applicable": True,
        "label": "ALIGNED",
        "ground_truth_cea": 0.96,
        "reason": "Component, failure mode, and numeric rule match exactly."
    },
    {
        "id": "bench-002",
        "condition": {
            "asset_id": "CNC-M102",
            "fault": "Heat Dissipation Failure (HDF)",
            "telemetry": "Delta T = 8.1 K (< 8.6 K), Speed = 1320 rpm (< 1380 rpm)"
        },
        "candidate": {
            "doc_id": "SYNTH-MAN-CHUCK-018",
            "page": 18,
            "passage": "When ambient air delta falls below threshold during low-speed tooling cycles, adjust regulator valve RV-204 and recalibrate chuck hydraulic clamps to 45 bar before spindle restart.",
            "component": "Workholding Pneumatic Chuck"
        },
        "applicable": False,
        "label": "CONFLICT (SEMANTIC PROXIMITY DISTRACTOR)",
        "ground_truth_cea": 0.21,
        "reason": "Lexical overlap on ambient air delta and low-speed, but component is Pneumatic Chuck, completely unrelated to Spindle Cooling."
    },
    {
        "id": "bench-003",
        "condition": {
            "asset_id": "BRG-301",
            "fault": "Outer-Race Bearing Degradation",
            "telemetry": "Kurtosis = 5.82 (> 4.5), Peak Frequency = 108.4 Hz"
        },
        "candidate": {
            "doc_id": "SYNTH-MAN-BRG-024",
            "page": 24,
            "passage": "Horizontal Vibration Kurtosis > 4.5 and BPFO modulation at 108 Hz > 14 dB denotes Stage-3 subsurface fatigue spalling. Inspect grease and schedule cartridge replacement.",
            "component": "Roller Bearing Cartridge"
        },
        "applicable": True,
        "label": "ALIGNED",
        "ground_truth_cea": 0.92,
        "reason": "Matches outer race spalling harmonic (108 Hz) and kurtosis threshold (> 4.5)."
    }
]

benchmark_file = os.path.join(MANUALS_DIR, 'synthetic_alignment_benchmark.json')
with open(benchmark_file, 'w', encoding='utf-8') as f:
    json.dump(benchmark, f, indent=2)

print(f"Generated synthetic maintenance corpus and benchmark in {MANUALS_DIR}")
