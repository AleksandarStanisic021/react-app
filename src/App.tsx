
import './App.css'
import ThreeScene from './components/ThreeScene'
import CarScene from './components/CarScene'

function App() {
  return (
    <>
      <h1>Three.js Scenes</h1>
      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', justifyContent: 'center' }}>
        <div style={{ flex: '1', minWidth: '400px' }}>
          <h2>Balls Scene</h2>
          <ThreeScene />
        </div>
        <div style={{ flex: '1', minWidth: '400px' }}>
          <h2>Cars Scene</h2>
          <CarScene />
        </div>
      </div>
    </>
  )
}

export default App
