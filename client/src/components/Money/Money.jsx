import { useValuesVisibility } from "../../context/ValuesVisibilityContext.jsx";
import { formatBRL } from "../../utils/formatCurrency";

// Componente central pra exibir qualquer valor monetário na tela.
// Sozinho, ele já respeita o toggle de "ocultar valores" — os cards não
// precisam saber nada sobre isso, só passam o número e (opcionalmente) uma
// className extra pra cor (value--positive / value--negative).
export default function Money({ value, className = "", prefix = "" }) {
  const { hidden } = useValuesVisibility();

  if (hidden) {
    return <span className={`money--hidden ${className}`}>R$ ••••</span>;
  }

  return (
    <span className={className}>
      {prefix}
      {formatBRL(value)}
    </span>
  );
}
