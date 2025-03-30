import { useParams } from "react-router-dom";

export default function Profile() {
  const { username } = useParams(); // ✅ Get username from URL

  return (
    <div>
      <h2>Profile of {username}</h2>
    </div>
  );
}
