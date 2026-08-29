import requests
import time
import os
import subprocess
import psutil
import logging

# Configuration from environment variables
API_URL = os.getenv("API_URL", "http://localhost:8000")
AGENT_TOKEN = os.getenv("AGENT_TOKEN", "your-agent-token")
INTERFACE_NAME = os.getenv("WG_INTERFACE", "wg0")
WG_CONF_PATH = f"/etc/wireguard/{INTERFACE_NAME}.conf"
POLL_INTERVAL = int(os.getenv("POLL_INTERVAL", "60"))

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

def get_peers():
    try:
        response = requests.get(f"{API_URL}/agent/peers", params={"agent_token": AGENT_TOKEN})
        if response.status_code == 200:
            return response.json()
        else:
            logging.error(f"Failed to get peers: {response.status_code} {response.text}")
            return None
    except Exception as e:
        logging.error(f"Error connecting to API: {e}")
        return None

def update_wg_config(peers):
    if peers is None:
        return

    # In a real environment, we would read the current config,
    # but for simplicity we'll just use wg set commands
    # or recreate the config and reload.

    # We assume wg0 is already up with its PrivateKey and ListenPort
    for peer in peers:
        pubkey = peer['public_key']
        allowed_ips = peer['allowed_ips']
        try:
            subprocess.run(["wg", "set", INTERFACE_NAME, "peer", pubkey, "allowed-ips", allowed_ips], check=True)
            logging.info(f"Updated peer {pubkey}")
        except Exception as e:
            logging.error(f"Failed to update peer {pubkey}: {e}")

def report_status():
    try:
        cpu = psutil.cpu_percent()
        ram = psutil.virtual_memory().percent
        # Simple way to get connections count from wg
        connections = 0
        try:
            output = subprocess.check_output(["wg", "show", INTERFACE_NAME, "endpoints"]).decode()
            connections = len([line for line in output.splitlines() if line.strip()])
        except:
            pass

        payload = {
            "cpu": cpu,
            "ram": ram,
            "connections": connections
        }
        requests.post(f"{API_URL}/agent/status", json=payload, params={"agent_token": AGENT_TOKEN})
        logging.info(f"Status reported: CPU={cpu}%, RAM={ram}%, Connections={connections}")
    except Exception as e:
        logging.error(f"Error reporting status: {e}")

def main():
    logging.info("Starting Node Agent...")
    while True:
        peers = get_peers()
        if peers:
            update_wg_config(peers)
        report_status()
        time.sleep(POLL_INTERVAL)

if __name__ == "__main__":
    main()
