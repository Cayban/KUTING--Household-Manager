import dogRunSprite from "../assets/dogRunSprite.webp";

export default function LoadingScreen() {
  return (
    <div className="loading-screen">
      <div
        className="loading-screen__sprite"
        style={{ backgroundImage: `url(${dogRunSprite})`, "--frames": 12 }}
      />
      <p className="loading-screen__brand">KUTING</p>
      <p className="loading-screen__text">Fetching your chores…</p>
    </div>
  );
}