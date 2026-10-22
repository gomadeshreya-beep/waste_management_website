import { API_BASE_URL } from "../services/api";

function ReportCard({ report, canResolve = false, onResolve, resolving = false, canDelete = false, onDelete, deleting = false, showReporter = false }) {
  const photoUrl = (image) => {
    if (!image) return "";
    if (/^https?:\/\//i.test(image)) return image;
    return `${API_BASE_URL}/uploads/${encodeURIComponent(image)}`;
  };
  const created = report.createdAt ? new Date(report.createdAt).toLocaleDateString() : "";
  const latitude = Number(report.latitude);
  const longitude = Number(report.longitude);
  const hasCoordinates = report.latitude !== null && report.latitude !== undefined && report.latitude !== ""
    && report.longitude !== null && report.longitude !== undefined && report.longitude !== ""
    && Number.isFinite(latitude) && latitude >= -90 && latitude <= 90
    && Number.isFinite(longitude) && longitude >= -180 && longitude <= 180;
  const mapUrl = hasCoordinates ? `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=18/${latitude}/${longitude}` : "";
  const address = report.location && report.location !== "Exact coordinates available to the local team"
    ? report.location
    : "Address unavailable";

  return (
    <article className="report-card">
      <div className="report-card-copy">
        <div className="report-card-heading">
          <h3>{report.title || "Waste issue reported"}</h3>
          <span className={`report-status ${report.status === "resolved" ? "resolved" : "pending"}`}>
            {report.status === "resolved" ? "Resolved" : "In progress"}
          </span>
        </div>
        <p>{report.description || "No additional details provided."}</p>
        {(address || report.area || created) && <small>{[address, report.area && report.area !== "Device GPS" && !address.includes(report.area) ? report.area : "", created].filter(Boolean).join(" · ")}</small>}
        {hasCoordinates && <small><a href={mapUrl} target="_blank" rel="noreferrer">View exact pin on map</a></small>}
        {report.locationSource === "openstreetmap" && <small>Address data © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap contributors</a></small>}
        {showReporter && <small className="report-reporter">Reported by: {report.userId?.email || "Account unavailable"}</small>}
        {showReporter && hasCoordinates && <small className="report-gps">Device GPS: <a href={mapUrl} target="_blank" rel="noreferrer">{Number(report.latitude).toFixed(6)}, {Number(report.longitude).toFixed(6)}</a> · accuracy about {Math.round(Number(report.locationAccuracy) || 0)} m</small>}
      </div>
      <div className="report-card-images">
        {report.photo && <a href={photoUrl(report.photo)} target="_blank" rel="noreferrer"><img src={photoUrl(report.photo)} alt={`Reported waste: ${report.title || "issue"}`} loading="lazy" /></a>}
        {report.proof && <a href={photoUrl(report.proof)} target="_blank" rel="noreferrer"><img src={photoUrl(report.proof)} alt="Cleanup completion proof" loading="lazy" /></a>}
      </div>
      {(canResolve && report.status !== "resolved" || canDelete) && (
        <div className="report-card-actions">
          {canResolve && report.status !== "resolved" && <button type="button" className="report-resolve-button" onClick={() => onResolve(report._id)} disabled={resolving || deleting}>
            {resolving ? "Updating…" : "Mark as resolved"}
          </button>}
          {canDelete && <button type="button" className="report-delete-button" onClick={() => onDelete(report._id)} disabled={resolving || deleting}>
            {deleting ? "Deleting…" : "Delete report"}
          </button>}
        </div>
      )}
    </article>
  );
}

export default ReportCard;
