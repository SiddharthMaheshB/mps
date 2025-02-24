
import "./styles.css"
export default function BackVideo({imgUrl,child}){
    return (
        <div className="video-container">
            <video autoPlay loop muted playsInline className="background-video">
                <source src={imgUrl} type="video/mp4" />
                Your browser does not support the video tag.
            </video>
            <div className="content">
              {child}
            </div>
        </div>
    );
}