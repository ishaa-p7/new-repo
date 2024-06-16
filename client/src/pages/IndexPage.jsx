import { useEffect } from "react"
import Post from "../Post"
import { useState } from "react";
import PropagateLoader from "react-spinners/PropagateLoader"

export default function IndexPage(){
    const [posts,setPosts]=useState([]);
    const [loading , setLoading] = useState(false)

    //loader styling
    const override = {
        display: "block",
        margin: "0 auto",
        borderColor: "red",
    };

    useEffect(()=>{
        setLoading(prev => true)
        fetch('/api/post').then(response=>{
            response.json().then(posts=>{
                setLoading(prev => false) 
setPosts(posts);
            });
        });
    },[]);

    if (loading) {
        return (
            <div style={{
                display:"flex",
                alignItems:"center",
                justifyContent:"center",
                width:"100%",
                height:"500px",
            }}>
                {loading && (<div>
                    <PropagateLoader
                        color="#36d7b7"
                        loading={loading}
                        cssOverride={override}
                        size={15}
                        aria-label="Loading Spinner"
                        data-testid="loader"
                    />
                </div>)}
            </div>
        )
    }
    
    

    return(
        <>
{posts.length>0 && posts.map(post=>(
    <Post {...post}/>
))}
        </>
    )
}