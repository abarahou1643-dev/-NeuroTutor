import React from "react";

/**
 * StatsCard
 * @param {React.Component} icon - Icône Lucide (ex: Award, Clock…)
 * @param {string} label - Libellé de la statistique
 * @param {string|number} value - Valeur affichée
 * @param {string} change - Texte secondaire (ex: "+5 cette semaine")
 * @param {string} color - Classe Tailwind bg-* (ex: bg-indigo-600)
 */
const StatsCard = ({
  icon: Icon,
  label = "",
  value = 0,
  change = "",
  color = "bg-indigo-600",
}) => {
  // 🔒 Sécurité si év. icon manquante
  const TextColor = color.startsWith("bg-")
    ? color.replace("bg-", "text-")
    : "text-indigo-600";

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl ${color} bg-opacity-10`}>
          {Icon ? (
            <Icon className={`h-6 w-6 ${TextColor}`} />
          ) : (
            <div className="h-6 w-6 rounded bg-gray-300" />
          )}
        </div>

        <span className="text-2xl font-bold text-gray-900">
          {value}
        </span>
      </div>

      <h3 className="text-gray-700 font-medium mb-1">
        {label}
      </h3>

      {change && (
        <p className="text-sm text-gray-500">
          {change}
        </p>
      )}
    </div>
  );
};

export default StatsCard;
