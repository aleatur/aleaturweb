import emblem from "../assets/brand/aleatur-emblem.svg";

export function Brand() {
  return (
    <span className="brand-lockup">
      <img className="brand-emblem" src={emblem} alt="" width="38" height="36" />
      <span>
        <strong>Aleatur</strong>
        <small>Perfumería y cuidado personal</small>
      </span>
    </span>
  );
}
