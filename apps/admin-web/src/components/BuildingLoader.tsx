import './BuildingLoader.css'

export function BuildingLoader() {
  return (
    <div className="loader-container">
      <div className="loader-wrapper">
        {/* Spinner circular */}
        <div className="spinner"></div>
        
        {/* Edificio en el centro */}
        <div className="building">
          {/* Techo */}
          <div className="roof"></div>
          
          {/* Cuerpo del edificio */}
          <div className="building-body">
            {/* Fila 1 de ventanas */}
            <div className="window-row">
              <div className="window window-anim-1"></div>
              <div className="window window-anim-2"></div>
              <div className="window window-anim-3"></div>
            </div>
            
            {/* Fila 2 de ventanas */}
            <div className="window-row">
              <div className="window window-anim-2"></div>
              <div className="window window-anim-1"></div>
              <div className="window window-anim-3"></div>
            </div>
            
            {/* Fila 3 de ventanas */}
            <div className="window-row">
              <div className="window window-anim-3"></div>
              <div className="window window-anim-2"></div>
              <div className="window window-anim-1"></div>
            </div>
            
            {/* Fila 4 de ventanas */}
            <div className="window-row">
              <div className="window window-anim-1"></div>
              <div className="window window-anim-3"></div>
              <div className="window window-anim-2"></div>
            </div>
            
            {/* Puerta */}
            <div className="door"></div>
          </div>
        </div>
        
        {/* Texto de carga */}
        <div className="loading-text">Cargando...</div>
      </div>
    </div>
  )
}