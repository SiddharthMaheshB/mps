export default function Shop({login}){
    if(!login){
        return(
            <>
            <p>404 Not found</p>
            </>
        )
    }
    return(
        <>
        <p>This is Shop</p>
        </>
    )
}