export default function Profile({login}){
    if(!login){
        return(
            <>
            <p>404 Not Found!!</p>
            </>
        )
    }
    return(
        <>
        <h1>This is Profile</h1>
        </>
    )
}