import Icon from '../assets/logo.png';  // Adjust the relative path if needed


function Logo(){
    return(
    <div style={{ display: 'flex', alignItems: 'center' }} >
        <img src={Icon} alt="Agri Intel Logo" style={{ width: '50px', height: 'auto', marginRight: '10px' }} />
        <h1 style={{ margin: 0 }}>Agri<br /> Intel</h1>
    </div>

    )
}
export default Logo