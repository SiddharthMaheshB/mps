export default function Fertiliser({login}){
    if(!login){
        return(
            <>
            <h1>404 Not Found!!</h1>
            </>
        )
    }
    return(
        <>
        <h1>This is fertiliser</h1>
        </>
    )
}