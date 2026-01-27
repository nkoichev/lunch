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
from google.oauth2 import service_account
from streamlit_lottie import st_lottie


SPREADSHEET_URL = st.secrets["spreadsheet"]

SPREADSHEET_ID = SPREADSHEET_URL.split("/d/")[1].split("/")[0]

# # --- CREDENTIALS ---

# credentials = service_account.Credentials.from_service_account_file(
#     'lunch2-389713-173ae4de9004.json',
#     scopes=SCOPES
# )


SCOPES = [
    "https://www.googleapis.com/auth/spreadsheets.readonly",
    "https://www.googleapis.com/auth/drive.metadata.readonly",
]

credentials = service_account.Credentials.from_service_account_info(
    st.secrets["gcp_service_account"],
    scopes=SCOPES,
)




# --- Streamlit UI tweaks ---
st.markdown("""
    <style>
        /* Hide sidebar */
        section[data-testid="stSidebar"][aria-expanded="true"]{
            display: none;
        }

        /* Mobile responsive adjustments */
        @media (max-width: 768px) {
            /* Reduce main container padding */
            .block-container {
                padding-left: 0.5rem !important;
                padding-right: 0.5rem !important;
                padding-top: 1rem !important;
            }

            /* Smaller header */
            .stMainBlockContainer {
                max-width: 100% !important;
            }

            /* Make dataframes scroll horizontally */
            .stDataFrame {
                font-size: 0.8rem;
            }

            /* Larger touch target for buttons */
            .stButton > button {
                width: 100%;
                padding: 0.75rem 1rem;
                font-size: 1.1rem;
            }

            /* Scale down Lottie animation on mobile */
            iframe[title="streamlit_lottie.st_lottie"] {
                max-width: 180px !important;
                max-height: 180px !important;
                margin: 0 auto;
            }
        }
    </style>
    """, unsafe_allow_html=True)

# --- Get spreadsheet last modified time (using Drive API, fast) ---
@st.cache_data(show_spinner=False)
def get_spreadsheet_modified_time():
    drive_service = build('drive', 'v3', credentials=credentials)
    meta = drive_service.files().get(fileId=SPREADSHEET_ID, fields='modifiedTime').execute()
    dt_utc = datetime.fromisoformat(meta['modifiedTime'].replace('Z', '+00:00'))
    sofia = pytz.timezone('Europe/Sofia')
    dt_sofia = dt_utc.astimezone(sofia)
    return dt_sofia.strftime('%d.%m.%Y | %H:%M')

formatted_time = get_spreadsheet_modified_time()
file_url = SPREADSHEET_URL
text = 'Open file'

# --- Load Google Sheets Data (use gspread with cache) ---
@st.cache_data(show_spinner=True, ttl=120)
def load_google_sheets_data():
    gc = gspread.authorize(credentials)
    sh = gc.open_by_key(SPREADSHEET_ID)

    # Only fetch the exact ranges needed (MUCH faster than get_all_values)
    ws_hora = sh.worksheet("Hora")
    data_hora = ws_hora.get_all_values()
    df_hora = pd.DataFrame(data_hora[1:], columns=data_hora[0])

    ws_mandji = sh.worksheet("Mandji")
    data_mandji = ws_mandji.get('A1:H')  # Adjust range as needed
    df_mandji = pd.DataFrame(data_mandji[1:], columns=data_mandji[0])

    ws_orders = sh.worksheet("Orders")
    data_orders = ws_orders.get('A3:I')  # Adjust range as needed
    df_orders = pd.DataFrame(data_orders[1:], columns=data_orders[0])
    for col in ['price', 'disc_price', 'quant', 'total']:
        if col in df_orders.columns:
            df_orders[col] = pd.to_numeric(df_orders[col], errors='coerce')

    return df_hora, df_mandji, df_orders

# --- Timed load for diagnostics, not cached ---
start_time = time.time()
df_hora, df_mandji, df_orders = load_google_sheets_data()


# --- Lottie Animation ---
with open("KjTHbioe5L.json", "r", errors='ignore') as f:
    data_lottie = json.load(f)

with st.container(horizontal=True, horizontal_alignment="center"):
    st_lottie(data_lottie, loop=False, width=300, height=300)

# --- Main Client Controls ---
@st.fragment
def client_controls(df_hora, df_orders):



    # check1 = st.toggle('Всички поръчали', value=True, key='check1')
    # check2 = st.toggle('Обобщено по имена', value=True, key='check2')

    df_current_clients = pd.pivot_table(
        df_orders, values=['total'], index=['Client'],
        aggfunc=np.sum, margins=True, margins_name='total', fill_value=0
    ).reset_index()
    li_current_clients = [i for i in df_current_clients['Client'].unique() if i not in ('total', '')]

    # if not check1:
    #     li_current_clients = []

    li_clients = df_hora['Client'].unique().tolist()
    # client = st.multiselect('', li_clients, default=li_current_clients, key='clients')

    client = li_current_clients

    df_main2 = df_orders.copy()
    if client:
        df_main2 = df_main2.loc[df_main2['Client'].isin(client)]
        suma = df_main2['total'].sum()
        df_client_obobshteno = df_main2.loc[:, ('Client', 'restorant', 'desc', 'price', 'disc_price', 'quant', 'total')]
        df_main_pivot = pd.pivot_table(
            df_client_obobshteno, values=['total'], index=['Client'],
            aggfunc=np.sum, margins=True, margins_name='total', fill_value=0
        ).reset_index()
        df_client = df_main2.loc[:, ('Client', 'restorant', 'desc', 'price', 'disc_price', 'quant', 'total')]

        if suma == 0:
            client_str = ', '.join(client) if isinstance(client, list) else str(client)
            st.write(f'**{client_str}**: :blue[**{format(round(suma, 2), ",.2f").replace(",0", "")}**] лева.')

        else:
            # if check2:
            for _, row in df_main_pivot.iterrows():
                if row['Client'] == 'total':
                    continue
                formatted_total = (
                    f"<span style='color:black'>{row['Client']}</span>: "
                    f"<span style='color:blue'>{row['total']:,.2f}</span>"
                ).replace(",", " ")
                s = f"<p style='font-size:clamp(1.4rem, 5vw, 2.5rem);'>{formatted_total}</p>"
                s = s.replace("total", "Общо")
                st.markdown(s, unsafe_allow_html=True)
        # else:
            st.write('---') 
            client_str = ', '.join(client) if isinstance(client, list) else str(client)
            st.write(f'**{client_str}**: :blue[**{format(round(suma, 2), ",.2f").replace(",0", "")}**] лева.')

            df_client_sorted = df_client.sort_values(by='Client', ascending=True)
            for _, row in df_client_sorted.iterrows():
                quant_str = f" x{int(row['quant'])}" if pd.notna(row['quant']) and row['quant'] > 1 else ""
                line = (
                    f"<span style='color:black'>{row['Client']}</span> — "
                    f"{row['desc']}{quant_str}: "
                    f"<span style='color:blue'>{row['total']:,.2f}</span>"
                ).replace(",", " ")
                st.markdown(
                    f"<p style='font-size:clamp(0.95rem, 3.5vw, 1.2rem); margin:0.2em 0;'>{line}</p>",
                    unsafe_allow_html=True,
                )

        st.write("---")
        st.write(f'Последна промяна: :red[**{formatted_time}**] /      [{text}]({file_url})')


client_controls(df_hora, df_orders)

button_update = st.button('🔄 Обнови данните')
if button_update:
    st.cache_data.clear()
    st.rerun()