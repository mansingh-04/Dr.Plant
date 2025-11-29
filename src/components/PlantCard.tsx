import { Link } from 'react-router-dom';
import { Card, CardContent } from './ui/card';
import { Leaf, Droplets, AlertTriangle, CheckCircle } from 'lucide-react';

const DEFAULT_PLANT_IMAGE = 'https://via.placeholder.com/150?text=No+Image';

export const PlantCard = ({ plant }: any) => {
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
  const imageUrl = plant.images?.[0]?.imageUrl
    ? `${API_BASE_URL}${plant.images[0].imageUrl}`
    : DEFAULT_PLANT_IMAGE;

  const latestRec = plant.recommendations?.[0];
  const isHealthy = !latestRec || !latestRec.disease || latestRec.disease.toLowerCase().includes('healthy');

  return (
    <Link to={`/plants/${plant.id}`} className="group block h-full">
      <Card className="h-full overflow-hidden glass-card border-none rounded-2xl group-hover:-translate-y-1 transition-transform duration-300">
        <div className="aspect-[4/3] relative overflow-hidden">
          <img
            src={imageUrl}
            alt={plant.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80" />

          <div className="absolute bottom-3 left-3 right-3 text-white">
            <h3 className="font-bold text-lg truncate shadow-sm">{plant.name}</h3>
            <p className="text-xs text-white/80 truncate font-medium">{plant.species || "Unknown Species"}</p>
          </div>
        </div>

        <CardContent className="p-4 pt-4">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              {(() => {
                // Check if disease string exists and is NOT "Healthy" (case insensitive)
                // Also check suggestionText for symptoms if disease is empty
                let hasDisease = latestRec && latestRec.disease && !latestRec.disease.toLowerCase().includes('healthy');
                let symptoms = [];

                if (latestRec && !latestRec.disease && latestRec.suggestionText) {
                  try {
                    const suggestion = JSON.parse(latestRec.suggestionText);
                    symptoms = suggestion.Sympotoms || [];
                    if (symptoms.length > 0) {
                      hasDisease = true;
                    }
                  } catch (e) {
                    // Ignore parsing error
                  }
                }

                if (!hasDisease) {
                  return (
                    <>
                      <div className="p-1.5 bg-emerald-500/10 rounded-full">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                      </div>
                      <span className="text-emerald-600 dark:text-emerald-400 font-medium">Healthy</span>
                    </>
                  );
                }

                const severeKeywords = ['virus', 'fungi', 'rot', 'blight', 'bacterial'];
                const diseaseText = (latestRec.disease || '') + ' ' + symptoms.join(' ');
                const isSevere = severeKeywords.some(keyword => diseaseText.toLowerCase().includes(keyword));

                if (isSevere) {
                  return (
                    <>
                      <div className="p-1.5 bg-red-500/10 rounded-full">
                        <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
                      </div>
                      <span className="text-red-600 dark:text-red-400 font-medium">Diseased</span>
                    </>
                  );
                }

                return (
                  <>
                    <div className="p-1.5 bg-yellow-500/10 rounded-full">
                      <AlertTriangle className="w-3.5 h-3.5 text-yellow-500" />
                    </div>
                    <span className="text-yellow-600 dark:text-yellow-400 font-medium">Potential Risk</span>
                  </>
                );
              })()}
            </div>
            <div className="flex items-center gap-1.5">
              <div className="p-1.5 bg-blue-500/10 rounded-full">
                <Droplets className="w-3.5 h-3.5 text-blue-500" />
              </div>
              <span>{plant.logs?.length || 0} logs</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};
