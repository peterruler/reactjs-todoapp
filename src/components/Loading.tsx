function Loading() {
  return (
    <div className="bg-dark text-light min-vh-100 d-flex justify-content-center align-items-center">
      <div className="text-center">
        <div className="spinner-border text-light mb-3" role="status">
          <span className="visually-hidden">Lade...</span>
        </div>
        <h4>Lade Daten...</h4>
        <p className="text-muted">Stelle sicher, dass der JSON-Server läuft (http://localhost:3001)</p>
      </div>
    </div>
  )
}

export default Loading
