# ResQ-TAG sensor and tunnel setup

## Start order

1. Start the MongoDB Atlas-connected API from the repository root:

   ```powershell
   cd backend
   npm run dev
   ```

   Confirm the API is listening on port 5000 and MongoDB connected. Check locally with:

   ```powershell
   Invoke-RestMethod http://localhost:5000/api/health
   Invoke-RestMethod http://localhost:5000/api/sensor-readings/latest
   ```

   The latest-reading endpoint returns HTTP 404 with `{"message":"No sensor readings found"}` until the first reading is stored.

2. In another terminal, expose the local API:

   ```powershell
   cloudflared tunnel --url http://localhost:5000
   ```

   Copy the current `https://….trycloudflare.com` hostname printed by cloudflared. Quick Tunnel hostnames are temporary and can change each time the tunnel restarts.

3. Set one hostname in the Wokwi `main.py` configuration and derive both endpoints from it:

   ```python
   TUNNEL_BASE_URL = "https://<current-hostname>.trycloudflare.com"
   API_URL = TUNNEL_BASE_URL + "/api/sensor-readings"
   HEALTH_URL = TUNNEL_BASE_URL + "/api/health"
   ```

   Do not leave an old hostname in either URL. The Wokwi simulator files are not present in this repository, so update them in the Wokwi project itself. Before sending sensor data, request `HEALTH_URL` and print its HTTP status and response (or exception); then print the POST status and response body. Set a finite request timeout and catch/report request exceptions. Never print credentials or environment variables. A successful local health check does not verify the public hostname; from a network client, request `https://<current-hostname>.trycloudflare.com/api/health` and confirm HTTP 200 with `status: OK` before relying on that tunnel.

4. Start the Wokwi simulation after the backend and tunnel are ready. Keep its existing `CONTAINER_ID` and 10-second send interval, changing the ID only to a registered container when you want the dashboard metadata to resolve.

## Monitoring behavior

The Monitoring page polls `/api/sensor-readings/latest` and `/api/containers` every 5 seconds. It displays the registered container name and product for the ID on the globally newest reading; a newly arriving reading for a different ID switches the display automatically. A reading older than 30 seconds is marked stale, allowing one missed 10-second post plus poll delay. Adjust `FRESHNESS_THRESHOLD_MS` in `frontend/src/pages/Monitoring.jsx` if the send interval changes.

To verify switching, send a reading with a registered container ID, note the ID/name/product and timestamp in Monitoring, then change Wokwi's `CONTAINER_ID` to a different registered ID and wait for its next post and the next dashboard poll. The displayed ID and resolved metadata should change to that newest reading.
