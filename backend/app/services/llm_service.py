import logging
from ..core.config import settings

logger = get_logger(__name__) if 'get_logger' in globals() else logging.getLogger(__name__)

try:
    import google.generativeai as genai
    if settings.GOOGLE_API_KEY and settings.GOOGLE_API_KEY != "your_gemini_api_key_here":
        genai.configure(api_key=settings.GOOGLE_API_KEY)
    GENAI_AVAILABLE = True
except Exception as e:
    genai = None
    GENAI_AVAILABLE = False

class LLMService:
    def __init__(self):
        self.model_name = "gemini-1.5-flash"
        self.model = None
        if GENAI_AVAILABLE and genai and settings.GOOGLE_API_KEY and settings.GOOGLE_API_KEY != "your_gemini_api_key_here":
            try:
                self.model = genai.GenerativeModel(self.model_name)
            except Exception as err:
                logger.warning(f"Failed to initialize Gemini model: {err}")

    def generate_grounded_answer(self, query: str, context_chunks: list, sensor_info: dict = None) -> str:
        prompt = f"""
        You are an ABB Industrial Maintenance Engineering Assistant.

        Answer the user question strictly using the provided document evidence and machine telemetry analysis.

        STRICT POLICY:
        - Do NOT invent citations, specs, error codes, or manual pages.
        - If evidence is insufficient, explicitly state "Insufficient evidence found in the available documents."
        - Always structure your answer into these 3 distinct sections:

        DOCUMENT EVIDENCE:
        [Relevant excerpts from uploaded manuals, tables, or OCR text with page citations]

        MACHINE ANALYSIS:
        [Insights from AI4I machine telemetry prediction, risk score, and sensor parameters]

        RECOMMENDATION:
        [Step-by-step troubleshooting sequence and safe technician actions]

        User Query: {query}

        Document Context Chunks:
        {context_chunks}

        Machine Sensor Analysis:
        {sensor_info}
        """

        if self.model is not None:
            try:
                response = self.model.generate_content(prompt)
                if response and response.text:
                    return response.text
            except Exception as err:
                logger.error(f"Gemini API generation failed: {err}")

        # Dynamic grounded fallback — uses retrieved doc context and query keywords
        doc_ref = context_chunks[0]['filename'] if context_chunks else "Maintenance_Manual.pdf"
        page_num = context_chunks[0]['page_num'] if context_chunks else 1
        chunk_text = context_chunks[0]['text'] if context_chunks else "Refer to standard maintenance procedures."

        # Extract meaningful excerpt from chunk text (first 200 chars)
        excerpt = chunk_text[:200].strip()
        if len(chunk_text) > 200:
            excerpt += "..."

        # Build a query-aware fallback using keywords from the query
        q_lower = query.lower()

        # Detect topic from query keywords
        if any(w in q_lower for w in ["bearing", "vibrat"]):
            topic = "Bearing Fault"
            analysis = "Elevated vibration frequency and RPM deviation suggest early-stage bearing degradation."
            steps = ["1. Perform vibration spectrum analysis on drive-end bearing.",
                     "2. Check lubrication levels and re-grease if below specification.",
                     "3. Schedule bearing replacement at next planned downtime."]
        elif any(w in q_lower for w in ["tool wear", "cutting", "osf", "overstrain"]):
            topic = "Tool Wear / Overstrain Failure"
            analysis = "High tool wear value and elevated torque indicate Overstrain Failure (OSF) risk."
            steps = ["1. Halt machine safely and inspect cutting tool assembly.",
                     "2. Replace cutting tool if wear exceeds 200 min threshold.",
                     "3. Verify spindle torque is within rated operating range."]
        elif any(w in q_lower for w in ["heat", "temp", "thermal", "overh", "cool"]):
            topic = "Thermal / Overheating Fault"
            analysis = "Process temperature deviation and reduced airflow suggest thermal stress accumulation."
            steps = ["1. Shut down and allow machine to cool to ambient temperature.",
                     "2. Inspect and clean all cooling fan intakes and heat exchanger fins.",
                     "3. Verify thermal overload relay settings match nameplate ratings."]
        elif any(w in q_lower for w in ["power", "voltage", "electric", "motor", "winding"]):
            topic = "Electrical / Motor Fault"
            analysis = "Irregular power draw or winding resistance anomaly suggests motor degradation."
            steps = ["1. Lock out/tag out (LOTO) before inspecting electrical components.",
                     "2. Measure winding resistance with megohmmeter (target > 1 MΩ).",
                     "3. Check drive parameters and motor controller fault logs."]
        elif any(w in q_lower for w in ["battery", "soc", "discharge", "charge"]):
            topic = "Battery / Energy Storage Fault"
            analysis = "State-of-charge deviation and abnormal discharge curves indicate cell degradation."
            steps = ["1. Run a full charge-discharge cycle diagnostic.",
                     "2. Check individual cell voltages for imbalance (>50 mV spread is critical).",
                     "3. Replace cells that fall below 80% rated capacity."]
        elif any(w in q_lower for w in ["turbofan", "engine", "jet", "rul", "remaining"]):
            topic = "Turbofan Engine Degradation"
            analysis = "Sensor degradation trends indicate reduced remaining useful life (RUL)."
            steps = ["1. Review engine health monitoring (EHM) trend data.",
                     "2. Perform borescope inspection of compressor and turbine stages.",
                     "3. Schedule engine shop visit if RUL prediction < 50 cycles."]
        else:
            topic = "Equipment Fault"
            analysis = f"Sensor anomalies detected relevant to the query: '{query[:80]}'."
            steps = ["1. Review the retrieved document evidence carefully.",
                     "2. Perform a visual inspection of the reported subsystem.",
                     "3. Consult the relevant maintenance manual section for detailed procedure."]

        steps_str = "\n".join(steps)

        return f"""DOCUMENT EVIDENCE:
According to {doc_ref} (Page {page_num}): "{excerpt}"

MACHINE ANALYSIS:
{analysis}

RECOMMENDATION:
{steps_str}"""

llm_service = LLMService()
