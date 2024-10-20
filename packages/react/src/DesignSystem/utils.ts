export {css as themeAwareCss} from "@styled-system/css";

const resetElementsCSS = `
  border: none;
  outline: none;
  box-shadow: none;
  text-shadow: none;
  text-decoration: none;
  -webkit-font-smoothing: inherit;
  -moz-osx-font-smoothing: inherit;
  -webkit-appearance: none;
  -webkit-box-sizing:border-box;
	-moz-box-sizing:border-box;
	box-sizing:border-box;
`;

export const resetCSS = `
  ${resetElementsCSS}
  & :hover, &:active, &:focus {
    ${resetElementsCSS}
  }
`;
