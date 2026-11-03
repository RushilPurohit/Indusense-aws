# InduSense Demo Files & Technical Manuals Package
Directory: demo_data_and_user_manuals/

This package contains authentic industrial telemetry CSV files and publication-grade PDF technical manuals for operating the InduSense platform and diagnosing physical industrial machinery.

================================================================================
INDEX OF FILES (9 Files + Index)
================================================================================

1. [01_demo_cnc_spindle_telemetry.csv] (CSV Telemetry)
   - Asset: CNC-M102 (5-Axis Spindle Mill)
   - Domain: AI4I 2020 Predictive Maintenance
   - Parameters: Air Temp (K), Process Temp (K), Rotational Speed (rpm), Torque (Nm), Tool Wear (min), Temp Delta (K), Vibration (mm/s).
   - Use Case: Demonstrates Heat Dissipation Failure (HDF) and Condition-Evidence Alignment (CEA).

2. [02_demo_roller_bearing_vibration.csv] (CSV Vibration)
   - Asset: MOTOR-DRV-01 / BRG-301 (Drive Motor Bearing)
   - Domain: FEMTO / Paderborn Bearing Dataset
   - Parameters: Horiz Accel (g), Vert Accel (g), Kurtosis, Crest Factor, FFT Peak Freq (108.4 Hz BPFO), Envelope dB.
   - Use Case: Outer race bearing degradation and impact shock monitoring.

3. [03_demo_hydraulic_system_sensors.csv] (CSV Sensors)
   - Asset: HYD-PRESS-P14 (Hydraulic Stamping Press)
   - Domain: UCI Hydraulic Systems
   - Parameters: Cooling Efficiency %, Valve Switching Time (s), Internal Pump Leakage, Hydraulic Pressure (bar), Motor Power (kW), Oil Temp (C).
   - Use Case: Cooler efficiency loss and directional valve switching lag.

4. [04_demo_factory_pump_monitoring.csv] (CSV Process)
   - Asset: PUMP-SLURRY-09 (Chemical Feed Centrifugal Pump)
   - Domain: Factory Sensors Multi-Stage Relational Dataset
   - Parameters: Flow Rate (m3/h), Suction Pressure (kPa), Discharge Pressure (kPa), Motor Current (A), Bearing Temp (C), Vibration Velocity (mm/s), Cavitation Flag.
   - Use Case: Low NPSH suction starvation, impeller cavitation erosion, and motor current overload.

5. [05_demo_turbofan_flight_cycles.csv] (CSV Degradation)
   - Asset: TURBO-TF004 (Commercial Turbofan Propulsion Engine)
   - Domain: C-MAPSS FD001 Benchmark
   - Parameters: Flight Cycles (1 to 164), Altitude (ft), Mach, HPC Outlet Temp T30 (deg R), Bypass Pressure P30 (psia), Core Speed Nc (rpm), True RUL Cycles.
   - Use Case: Multi-cycle Remaining Useful Life (RUL) degradation tracking and borescope inspection scheduling.

6. [06_USER_MANUAL_INDUSENSE_PLATFORM.pdf] (PDF Document)
   - Platform User Manual: Comprehensive guide to navigating InduSense, role-based authority panels (Engineer, Technician, Admin), uploading telemetry runs, interpreting CEA alignment scores, and signing off with audit trails.

7. [07_MANUAL_CNC_SPINDLE_MAINTENANCE_SOP.pdf] (PDF Document)
   - Technical Maintenance Standard for CNC-M102: Disassembly protocol, cooling fan CF-02 mesh cleaning, stator thermistor re-seating, and heat dissipation verification.

8. [08_MANUAL_ROLLER_BEARING_REPLACEMENT_GUIDE.pdf] (PDF Document)
   - Technical Maintenance Standard for BRG-301: ISO 10816 vibration severity, induction heating shrink-fit installation, and grease specification.

9. [09_MANUAL_HYDRAULIC_PRESS_TROUBLESHOOTING.pdf] (PDF Document)
   - Technical Maintenance Standard for HYD-PRESS-P14: Plate heat exchanger descaling, accumulator nitrogen pre-charge testing, and valve spool servicing.

10. [AWS_FREE_TIER_CLOUD_ARCHITECTURE_INDUSENSE.pdf] (PDF Document)
   - AWS Cloud Computing Free Tier Guide: In-depth cloud architecture mapping for InduSense, covering AWS Lambda, S3, DynamoDB, CloudFront, Cognito, API Gateway, and EC2 Free Tier (/month).
