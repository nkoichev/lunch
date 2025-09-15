import os
import json
import time
from datetime import datetime, timedelta

import streamlit as st
import pandas as pd
import numpy as np
import pytz
import gspread
from googleapiclient.discovery import build
from google.oauth2.service_account import Credentials
from google.auth.exceptions import RefreshError

# --- Load config from secrets or env ---
# Expected layout in .streamlit/secrets.toml:
# [gcp_service_account]
# <paste json fields here>
#
# [default]
# SCOPES = [ "https://www.googleapis.com/auth/spreadsheets.readonly", ... ]
# SPREADSHEET_URL = "https://docs.google.com/spreadsheets/d/...."

service_account_info = None
if "gcp_service_account" in st.secrets:
    service_account_info = st.secrets["gcp_service_account"]

# fallback names if you keep local json for local dev
LOCAL_SERVICE_ACCOUNT_FILE = "lunch2-389713-173ae4de9004.json"

# scopes and spreadsheet URL reading
try:
    scopes = st.secrets["default"]["SCOPES"]
    spreadsheet_url = st.secrets["default"]["SPREADSHEET_URL"]
except Exception:
    # Try environment fallback or default minimal scopes
    scopes = [
        "https://www.googleapis.com/auth/spreadsheets.readonly",
        "https://www.googleapis.com/auth/drive.metadata.readonly",
    ]
    spreadsheet_url = os.environ.get("SPREADSHEET_URL", "")

if not spreadsheet_url:
    st.error("SPREADSHEET_URL not found in st.secrets or environment. Add it to .streamlit/secrets.toml")
    st.stop()

SPREADSHEET_ID = spreadsheet_url.split("/d/")[1].split("/")[0]

# --- Build credentials (prefer st.secrets for Streamlit Cloud, fallback to local file) ---
credentials = None
try:
    if service_account_info:
        credentials = Credentials.from_service_account_info(service_account_info, scopes=scopes)
    elif os.path.exists(LOCAL_SERVICE_ACCOUNT_FILE):
        credentials = Credentials.from_service_account_file(LOCAL_SERVICE_ACCOUNT_FILE, scopes=scopes)
    else:
        st.error("Service account credentials not found. Put them in .streamlit/secrets.toml under [gcp_service_account] or add a local JSON file.")
        st.stop()
except Exception as e:
    st.error(f"Error creating credentials: {e}")
    st.stop()

# --- UI tweaks (optional) ---
st.markdown(
    """
    <style>
        section[data-testid="stSidebar"][aria-expanded="true"]{
            display: none;
        }
    </style>
    """,
    unsafe_allow_html=True,
)

# --- Get spreadsheet last modified time (Drive API) ---
@st.cache_data(show_spinner=False)
def get_spreadsheet_modified_time(spreadsheet_id: str):
    try:
        drive_service = build("drive", "v3", credentials=credentials)
        meta = drive_service.files().get(fileId=spreadsheet_id, fields="modifiedTime").execute()
        dt_utc = datetime.fromisoformat(meta["modifiedTime"].replace("Z", "+00:00"))
        sofia = pytz.timezone("Europe/Sofia")
        dt_sofia = dt_utc.astimezone(sofia)
        return dt_sofia.strftime("%d.%m.%Y | %H:%M")
    except RefreshError as re:
        # common invalid JWT / credentials error
        st.error("Credentials refresh error (invalid JWT). Make sure service account JSON in secrets is exact and the sheet is shared with the service account email.")
        raise re
    except Exception as e:
        st.warning(f"Could not fetch modified time: {e}")
        return "N/A"

formatted_time = get_spreadsheet_modified_time(SPREADSHEET_ID)
file_url = spreadsheet_url
text = "Open file"

# --- Load Google Sheets Data (gspread) ---
@st.cache_data(show_spinner=True, ttl=120)
def load_google_sheets_data(spreadsheet_id: str):
    try:
        # gspread accepts google-auth Credentials
        gc = gspread.authorize(credentials)
        sh = gc.open_by_key(spreadsheet_id)
    except RefreshError as re:
        st.error("RefreshError while authorizing with gspread (invalid credentials).")
        raise re
    except Exception as e:
        st.error(f"Failed to open spreadsheet: {e}")
        raise e

    # helper to safely read a worksheet range into DataFrame
    def sheet_to_df(worksheet, range_a1=None, header_row=1):
        try:
            if range_a1:
                values = worksheet.get(range_a1)
            else:
                values = worksheet.get_all_values()
            if not values or len(values) < header_row:
                return pd.DataFrame()
            header = values[header_row - 1]
            data = values[header_row:]
            df = pd.DataFrame(data, columns=header)
            return df
        except Exception:
            return pd.DataFrame()

    # Read sheets (adjust names/ranges if necessary)
    try:
        ws_hora = sh.worksheet("Hora")
        df_hora = sheet_to_df(ws_hora, None, header_row=1)
    except Exception:
        df_hora = pd.DataFrame()

    try:
        ws_mandji = sh.worksheet("Mandji")
        # example: read A1:H (header in row1)
        df_mandji = sheet_to_df(ws_mandji, "A1:H", header_row=1)
    except Exception:
        df_mandji = pd.DataFrame()

    try:
        ws_orders = sh.worksheet("Orders")
        # header located at row 3 in original code -> adjust: header_row=1 if A3:I includes header in first returned row
        # here assume header is first row of returned range, so we request A3:I and header_row=1
        data_orders = ws_orders.get("A3:I")
        if data_orders and len(data_orders) >= 1:
            df_orders = pd.DataFrame(data_orders[1:], columns=data_orders[0])
        else:
            df_orders = pd.DataFrame()
    except Exception:
        df_orders = pd.DataFrame()

    # numeric coercion
    for col in ["price", "disc_price", "quant", "total"]:
        if col in df_orders.columns:
            df_orders[col] = pd.to_numeric(df_orders[col], errors="coerce")

    return df_hora, df_mandji, df_orders

# --- Timed load for diagnostics ---
start_time = time.time()
try:
    df_hora, df_mandji, df_orders = load_google_sheets_data(SPREADSHEET_ID)
except RefreshError:
    st.stop()
load_time = timedelta(seconds=int(time.time() - start_time))

# --- Lottie Animation (optional) ---
data_lottie = None
lottie_path = "KjTHbioe5L.json"
if os.path.exists(lottie_path):
    try:
        with open(lottie_path, "r", errors="ignore") as f:
            data_lottie = json.load(f)
    except Exception:
        data_lottie = None

col1, col2, col3 = st.columns([1.6, 3, 7])
with col1:
    if data_lottie:
        try:
            from streamlit_lottie import st_lottie
            st_lottie(data_lottie, loop=False, width=100, height=100)
        except Exception:
            st.image("https://via.placeholder.com/100")  # fallback
    else:
        st.image("https://via.placeholder.com/100")

# --- Main Client Controls (function) ---
def client_controls(df_hora, df_orders, load_time_str, formatted_time, file_url, text):
    check1 = st.checkbox("Всички поръчали до момента", value=True, key="check1")
    check2 = st.checkbox("Обобщено по имена", value=True, key="check2")

    if df_orders is None or df_orders.empty:
        st.info("Няма данни в Orders листа.")
        return

    # pivot for current clients
    df_current_clients = pd.pivot_table(
        df_orders, values=["total"], index=["Client"], aggfunc=np.sum, margins=True, margins_name="total", fill_value=0
    ).reset_index()
    li_current_clients = [i for i in df_current_clients["Client"].unique() if i not in ("total", "", None)]

    if not check1:
        li_current_clients = []

    li_clients = df_hora["Client"].dropna().unique().tolist() if (df_hora is not None and not df_hora.empty and "Client" in df_hora.columns) else []
    client = st.multiselect("", li_clients, default=li_current_clients, key="clients")

    df_main2 = df_orders.copy()
    if client:
        df_main2 = df_main2.loc[df_main2["Client"].isin(client)]
        suma = df_main2["total"].sum()
        cols_needed = [c for c in ("Client", "restorant", "desc", "price", "disc_price", "quant", "total") if c in df_main2.columns]
        df_client_obobshteno = df_main2.loc[:, cols_needed]
        df_main_pivot = pd.pivot_table(
            df_client_obobshteno, values=["total"], index=["Client"], aggfunc=np.sum, margins=True, margins_name="total", fill_value=0
        ).reset_index()
        df_client = df_main2.loc[:, cols_needed]

        if suma == 0:
            st.write(f"**{client}**: :blue[**{format(round(suma, 2), ',.2f').replace(',0','')}**] лева.")
        else:
            if check2:
                for _, row in df_main_pivot.iterrows():
                    if row["Client"] == "total":
                        continue
                    formatted_total = (
                        f"<span style='color:black'>{row['Client']}</span>: "
                        f"<span style='color:blue'>{row['total']:,.2f}</span>"
                    ).replace(",", " ")
                    s = f"<p style='font-size:40px;'>{formatted_total}</p>"
                    s = s.replace("total", "Общо")
                    st.markdown(s, unsafe_allow_html=True)
            else:
                st.write(f"**{client}**: :blue[**{format(round(suma, 2), ',.2f').replace(',0','')}**] лева.")
                if not df_client.empty:
                    df_client_sorted = df_client.sort_values(by="Client", ascending=True)
                    styled_df = df_client_sorted.style.format(thousands=" ", precision=2)
                    st.dataframe(styled_df, use_container_width=True, hide_index=True)

        st.write("---")
        st.write(f"Последна промяна: :red[**{formatted_time}**] /      [{text}]({file_url})")

    # Update button
    button_update = st.button("🔄 Обнови данните")
    if button_update:
        st.cache_data.clear()
        st.experimental_rerun()


# --- Run UI ---
client_controls(df_hora, df_orders, str(load_time), formatted_time, file_url, text)
