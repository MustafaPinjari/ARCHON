"""ARCHON - The Engineering Memory Engine
Streamlit Web Dashboard for hackFront India 2026 (Theme: T1 - AI & Developer Tools).
"""

import os
import streamlit as st
from archon.evidence import PillarType
from archon.investigator import Investigator
from archon.repository import RepositoryManager
from archon.demo_data import DEMO_SYMBOLS, DEMO_QUESTIONS


st.set_page_config(
    page_title="ARCHON — The Engineering Memory Engine",
    page_icon="🛡️",
    layout="wide",
    initial_sidebar_state="expanded",
)

# Custom Styling for Cyber/Developer Tool Dark Theme
st.markdown(
    """
    <style>
    /* Dark Theme Core Styles */
    .stApp {
        background: linear-gradient(180deg, #0b0f19 0%, #0d121f 100%);
        color: #e2e8f0;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    }
    
    /* Brand Mark Header */
    .brand-title {
        font-family: 'Courier New', Courier, monospace;
        font-size: 2.2rem;
        font-weight: 800;
        letter-spacing: -0.05em;
        background: linear-gradient(90deg, #10b981 0%, #06b6d4 50%, #3b82f6 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        margin-bottom: 0px;
    }
    .brand-subtitle {
        color: #94a3b8;
        font-size: 1.05rem;
        font-weight: 500;
        letter-spacing: 0.05em;
        text-transform: uppercase;
        margin-top: -4px;
        margin-bottom: 15px;
    }

    /* Hackathon Badge */
    .hackathon-badge {
        display: inline-block;
        padding: 4px 10px;
        background: rgba(16, 185, 129, 0.12);
        border: 1px solid rgba(16, 185, 129, 0.3);
        border-radius: 9999px;
        color: #34d399;
        font-size: 0.78rem;
        font-weight: 600;
        letter-spacing: 0.04em;
        margin-bottom: 12px;
    }

    /* Cards */
    .archon-card {
        background: #131b2e;
        border: 1px solid #1e293b;
        border-radius: 10px;
        padding: 20px;
        margin-bottom: 18px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
    }

    /* Watermark Banners */
    .demo-watermark {
        background: rgba(245, 158, 11, 0.12);
        border: 1px solid rgba(245, 158, 11, 0.4);
        border-left: 4px solid #f59e0b;
        border-radius: 6px;
        padding: 12px 16px;
        color: #fde68a;
        font-size: 0.9rem;
        font-weight: 600;
        margin-bottom: 16px;
    }
    
    .live-watermark {
        background: rgba(16, 185, 129, 0.12);
        border: 1px solid rgba(16, 185, 129, 0.4);
        border-left: 4px solid #10b981;
        border-radius: 6px;
        padding: 12px 16px;
        color: #a7f3d0;
        font-size: 0.9rem;
        font-weight: 600;
        margin-bottom: 16px;
    }

    /* Code blocks */
    .code-receipt {
        background: #090d16;
        border: 1px solid #1e293b;
        border-radius: 6px;
        padding: 12px;
        font-family: 'Consolas', 'Courier New', monospace;
        font-size: 0.85rem;
        color: #38bdf8;
        white-space: pre-wrap;
        overflow-x: auto;
    }

    /* Status Indicator */
    .status-dot {
        height: 9px;
        width: 9px;
        background-color: #10b981;
        border-radius: 50%;
        display: inline-block;
        margin-right: 6px;
        box-shadow: 0 0 8px #10b981;
    }
    </style>
    """,
    unsafe_allow_html=True,
)


def main():
    # Sidebar: Repository & Safety Controls
    with st.sidebar:
        st.markdown("<div class='hackathon-badge'>hackFront India 2026 // Track T1</div>", unsafe_allow_html=True)
        st.markdown("<h2 style='margin-top:0;'>⚙️ Workspace</h2>", unsafe_allow_html=True)

        repo_mode = st.radio(
            "Repository Source:",
            ["Demo Repository (Fictional E-Commerce Core)", "Local Git Repository"],
            index=0,
        )

        is_demo = "Demo" in repo_mode
        local_path = ""
        val_result = None

        if is_demo:
            st.info(
                "**Selected**: `aegis-commerce-core` (Curated Demo Data)\n\n"
                "- 12,400 Lines of Code\n"
                "- 450 Commits in Git Tree\n"
                "- 4 Critical Microservices\n"
                "- 100% Offline & Pre-verified"
            )
        else:
            default_path = os.getcwd()
            local_path = st.text_input(
                "Enter Local Repository Directory Path:",
                value=default_path,
                help="Absolute or relative path to a local project directory.",
            )
            if local_path:
                val_result = RepositoryManager.validate_path(local_path)
                if val_result.is_valid:
                    if val_result.is_git_repo:
                        st.success(
                            f"✅ Valid Git Repository\n\n"
                            f"**Branch**: `{val_result.git_branch or 'main'}`\n\n"
                            f"**Path**: `{val_result.resolved_path}`"
                        )
                    else:
                        st.warning(
                            f"⚠️ Valid directory, but **not a Git repo**.\n\n"
                            f"(Git archaeology will be disabled, but file & test scanning will work)."
                        )
                else:
                    st.error(f"❌ {val_result.error_message}")

        st.markdown("---")
        st.markdown("### 🛡️ Security & Privacy Guard")
        st.markdown(
            """
            - **Zero Code Execution**: Code is only inspected via static text & Git CLI.
            - **Secret Scrubbing**: API keys & tokens automatically redacted.
            - **Blacklist Active**: `.env`, `.pem`, `id_rsa`, `node_modules` blocked.
            - **Air-Gapped**: 100% Local, zero data leaves your workstation.
            """
        )

        st.markdown("---")
        st.caption("ARCHON v0.1.0 • Built with Python & Streamlit")

    # Main Area Header
    col_head1, col_head2 = st.columns([3, 1])
    with col_head1:
        st.markdown("<div class='brand-title'>ARCHON</div>", unsafe_allow_html=True)
        st.markdown("<div class='brand-subtitle'>The Engineering Memory Engine</div>", unsafe_allow_html=True)
    with col_head2:
        st.markdown(
            """
            <div style='text-align: right; padding-top: 10px;'>
                <span class='status-dot'></span>
                <span style='font-size: 0.85rem; color: #10b981; font-weight: 600;'>ZERO-EXECUTION ACTIVE</span>
            </div>
            """,
            unsafe_allow_html=True,
        )

    st.markdown(
        "ARCHON recovers **why** software code was designed the way it was by assembling "
        "verifiable receipts across **Git history**, **architectural docstrings**, **test suites**, and **blast radius**."
    )

    # Investigation Input Section
    st.markdown("<div class='archon-card'>", unsafe_allow_html=True)
    st.subheader("🔎 Start Engineering Investigation")

    col_sym, col_q = st.columns([1, 1])

    with col_sym:
        if is_demo:
            symbol_choice = st.selectbox(
                "Target Function / Component to Investigate:",
                DEMO_SYMBOLS,
                index=0,
                help="Select one of the sample symbols modeling high-stakes legacy code.",
            )
            target_symbol = symbol_choice
        else:
            is_bahub = local_path and "bahub" in local_path.lower()
            if is_bahub:
                st.caption("✨ Detected BAHub repository. Quick verified symbols:")
                preset_sym = st.selectbox(
                    "Select Audited BAHub Symbol or enter custom:",
                    ["TenantSubscription", "SecurityHeadersMiddleware", "CreditManager", "Custom Symbol..."],
                    index=0,
                )
                if preset_sym == "Custom Symbol...":
                    target_symbol = st.text_input("Enter symbol name:", value="TenantSubscription")
                else:
                    target_symbol = preset_sym
            else:
                target_symbol = st.text_input(
                    "Target Function / Class / Module to Investigate:",
                    value="RepositoryManager",
                    help="Enter the exact function, class, or method name to trace.",
                )

    with col_q:
        question_selection = st.selectbox(
            "Investigation Question:",
            DEMO_QUESTIONS + ["Custom Question..."],
            index=0,
        )
        if question_selection == "Custom Question...":
            final_question = st.text_input("Enter your custom investigation question:", value="Why does this exist?")
        else:
            final_question = question_selection

    investigate_btn = st.button("🚀 Investigate Engineering Memory", type="primary", use_container_width=True)
    st.markdown("</div>", unsafe_allow_html=True)

    # Execution State
    if "has_run" not in st.session_state:
        st.session_state.has_run = False
        st.session_state.last_result = None

    if investigate_btn:
        with st.spinner("Analyzing Git history, source AST contracts, and test mesh..."):
            investigator = Investigator(repo_path=local_path if not is_demo else None, is_demo=is_demo)
            result = investigator.investigate(symbol=target_symbol, question=final_question)
            st.session_state.has_run = True
            st.session_state.last_result = result

    # Display Results
    if st.session_state.has_run and st.session_state.last_result:
        res = st.session_state.last_result

        # Honest Watermark Banner
        if res.is_demo:
            st.markdown(
                f"<div class='demo-watermark'>⚠️ <strong>{res.status_label}</strong><br/>"
                "All commits, incidents, and test files displayed below are curated fictional examples "
                "demonstrating ARCHON's verifiable evidence model.</div>",
                unsafe_allow_html=True,
            )
        else:
            st.markdown(
                f"<div class='live-watermark'>🛡️ <strong>{res.status_label}</strong><br/>"
                f"Ground-truth receipts extracted live from: <code>{res.repository_path}</code></div>",
                unsafe_allow_html=True,
            )

        # 1. Executive Synthesis
        st.markdown("<div class='archon-card'>", unsafe_allow_html=True)
        st.markdown("### 🧠 Engineering Memory Rationale")
        st.markdown(res.synthesis)
        st.markdown("</div>", unsafe_allow_html=True)

        # 2. Four Pillars Evidence Explorer
        st.subheader(f"📊 Verifiable Evidence Receipts ({res.total_evidence_count} Found)")

        tab_git, tab_contract, tab_test, tab_blast = st.tabs([
            "📜 Temporal Intent (Git)",
            "📐 Architectural Contract (Source)",
            "🧪 Verification Mesh (Tests)",
            "🕸️ Blast Radius (Callers)",
        ])

        with tab_git:
            git_items = res.filter_by_pillar(PillarType.TEMPORAL_GIT)
            if git_items:
                for item in git_items:
                    with st.expander(f"🟢 [{item.confidence_label}] {item.title}", expanded=True):
                        st.markdown(f"**Location**: `{item.location}`")
                        if item.author:
                            st.markdown(f"**Author**: {item.author} • **Timestamp**: {item.timestamp}")
                        st.markdown(f"**Summary**: {item.summary}")
                        st.markdown("<strong>Verifiable Git Receipt:</strong>", unsafe_allow_html=True)
                        st.markdown(f"<div class='code-receipt'>{item.verifiable_payload}</div>", unsafe_allow_html=True)
            else:
                st.info("🔍 **Not found by this search**: No Git commits directly modifying this symbol were returned by Git pickaxe (`-S`) or grep within the recent history depth on the current branch.")

        with tab_contract:
            contract_items = res.filter_by_pillar(PillarType.CONTRACT_INVARIANT)
            if contract_items:
                for item in contract_items:
                    with st.expander(f"🔵 [{item.confidence_label}] {item.title}", expanded=True):
                        st.markdown(f"**Location**: `{item.location}`")
                        st.markdown(f"**Summary**: {item.summary}")
                        st.markdown("<strong>Source Code Invariant / Signature:</strong>", unsafe_allow_html=True)
                        st.markdown(f"<div class='code-receipt'>{item.verifiable_payload}</div>", unsafe_allow_html=True)
            else:
                st.info("🔍 **Not found by this search**: No explicit definition signature (`class`, `def`, `function`) matching this token was found across scanned source files.")

        with tab_test:
            test_items = res.filter_by_pillar(PillarType.VERIFICATION_TEST)
            if test_items:
                for item in test_items:
                    with st.expander(f"🟣 [{item.confidence_label}] {item.title}", expanded=True):
                        st.markdown(f"**Location**: `{item.location}`")
                        st.markdown(f"**Summary**: {item.summary}")
                        st.markdown("<strong>Test Assertion Code:</strong>", unsafe_allow_html=True)
                        st.markdown(f"<div class='code-receipt'>{item.verifiable_payload}</div>", unsafe_allow_html=True)
            else:
                st.warning("🔍 **Not found by this search**: No test files directly assert or invoke this symbol. Note: It may be exercised indirectly through broader end-to-end suites.")

        with tab_blast:
            dep_items = res.filter_by_pillar(PillarType.STRUCTURAL_DEPENDENCY)
            if dep_items:
                for item in dep_items:
                    with st.expander(f"🟠 [{item.confidence_label}] {item.title}", expanded=True):
                        st.markdown(f"**Location**: `{item.location}`")
                        st.markdown(f"**Summary**: {item.summary}")
                        st.markdown("<strong>Downstream Usage Snippet:</strong>", unsafe_allow_html=True)
                        st.markdown(f"<div class='code-receipt'>{item.verifiable_payload}</div>", unsafe_allow_html=True)
            else:
                st.info("🔍 **Not found by this search**: No external downstream callers or import references detected in the scanned repository files.")

        # 3. Honest Capability Breakdown & Next Steps
        st.markdown("<div class='archon-card'>", unsafe_allow_html=True)
        col_cap, col_rec = st.columns([1, 1])

        with col_cap:
            st.markdown("#### 🔍 Capability Audit")
            st.markdown("**Currently Implemented (Milestone 1):**")
            for c in res.capabilities_implemented:
                st.markdown(f"- ✅ {c}")
            st.markdown("**Planned Roadmap (Milestone 2+):**")
            for p in res.capabilities_pending:
                st.markdown(f"- ⏳ {p}")

        with col_rec:
            st.markdown("#### 💡 Recommended Actions Before Refactoring")
            for r in res.recommended_next_steps:
                st.markdown(f"- 👉 {r}")

        st.markdown("</div>", unsafe_allow_html=True)


if __name__ == "__main__":
    main()
