/* eslint-disable */

export interface SpannerProps extends React.SVGAttributes<SVGSVGElement> {}

export const Spanner = (props: SpannerProps) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      viewBox="0 0 1027 1024"
      {...props}
    >
      <path
        fill="currentColor"
        d="M558.754 558.736 373.418 608.47l-135.7-135.8 49.738-185.236 185.334-49.736 135.7 135.7z"
      />
      <path
        fill="currentColor"
        d="m17.959 377.4 330.04 330.042 283.506-75.856 75.956-283.608L377.321 17.94c171.425-46.435 362.064-2.803 496.663 131.794 199.943 199.948 199.943 524.286 0 724.23-200.049 200.048-524.283 200.048-724.33 0C15.056 739.467-28.476 548.726 17.958 377.4"
      />
    </svg>
  );
};
