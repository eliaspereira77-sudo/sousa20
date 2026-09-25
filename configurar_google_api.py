import os
import json
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
from googleapiclient.discovery import build

# Escopos necessários
SCOPES = [
    'https://www.googleapis.com/auth/script.projects',
    'https://www.googleapis.com/auth/script.deployments',
    'https://www.googleapis.com/auth/drive'
]

print("="*60)
print("CONFIGURAÇÃO DO SOUSA IA PARA TRABALHAR NA NUVEM")
print("="*60)
print("\n1. Acesse: https://console.cloud.google.com/")
print("2. Crie um projeto (ou use um existente)")
print("3. Ative as APIs:")
print("   - Google Apps Script API")
print("   - Google Drive API")
print("4. Vá em 'Credenciais' > 'Criar Credenciais' > 'OAuth client ID'")
print("5. Tipo: 'Desktop app'")
print("6. Baixe o JSON e salve como 'credentials.json' nesta pasta")
print("\n" + "="*60)
input("Pressione ENTER quando tiver o arquivo credentials.json...")

if not os.path.exists('credentials.json'):
    print("\n[ERRO] Arquivo credentials.json não encontrado!")
    exit(1)

print("\n[INFO] Autenticando...")
flow = InstalledAppFlow.from_client_secrets_file('credentials.json', SCOPES)
creds = flow.run_local_server(port=0)

# Salvar credenciais
with open('token.json', 'w') as token:
    token.write(creds.to_json())

print("\n[OK] Autenticação concluída!")
print("[OK] Token salvo em token.json")
print("\n[INFO] Agora o SOUSA IA pode editar o Apps Script remotamente!")
