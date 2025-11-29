import { Link } from 'react-router-dom';
import { API_BASE_URL } from '../lib/api';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Leaf, Droplets, Calendar, AlertTriangle, CheckCircle } from 'lucide-react';

const DEFAULT_PLANT_IMAGE = 'https://via.placeholder.com/150?text=No+Image';

export const PlantListItem = ({ plant }: any) => {
    const imageUrl = plant.images?.[0]?.imageUrl
        ? `${API_BASE_URL}${plant.images[0].imageUrl}`
        : DEFAULT_PLANT_IMAGE;

    const latestRec = plant.recommendations?.[0];
    // Check if disease string exists and is NOT "Healthy" (case insensitive)
    const hasDisease = latestRec && latestRec.disease && !latestRec.disease.toLowerCase().includes('healthy');
    const logCount = plant.logs?.length || 0;

    return (
        <Link to={`/plants/${plant.id}`} className="group block mb-4">
            <Card className="overflow-hidden glass-card border-none rounded-2xl hover:bg-white/60 dark:hover:bg-white/10 transition-all duration-300">
                <div className="flex flex-col sm:flex-row h-full">
                    {/* Image Section */}
                    <div className="w-full sm:w-52 h-52 shrink-0 relative overflow-hidden sm:rounded-l-2xl">
                        <img
                            src={imageUrl}
                            alt={plant.name}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
                    </div>

                    {/* Content Section */}
                    <CardContent className="flex-1 p-5 flex flex-col justify-center gap-3">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div>
                                <h3 className="font-bold text-xl text-foreground group-hover:text-primary transition-colors">{plant.name}</h3>
                                <p className="text-sm text-muted-foreground font-medium">{plant.species || "Unknown Species"}</p>
                            </div>

                            <div className="shrink-0">
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
                                            <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-emerald-500/20 px-3 py-1">
                                                <CheckCircle className="w-3.5 h-3.5 mr-1.5" /> Healthy
                                            </Badge>
                                        );
                                    }

                                    // Check for severe keywords in disease name OR symptoms
                                    const severeKeywords = ['virus', 'fungi', 'rot', 'blight', 'bacterial'];
                                    const diseaseText = (latestRec.disease || '') + ' ' + symptoms.join(' ');
                                    const isSevere = severeKeywords.some(keyword => diseaseText.toLowerCase().includes(keyword));

                                    if (isSevere) {
                                        return (
                                            <Badge variant="destructive" className="bg-red-500/10 text-red-600 hover:bg-red-500/20 border-red-500/20 px-3 py-1">
                                                <AlertTriangle className="w-3.5 h-3.5 mr-1.5" /> Diseased
                                            </Badge>
                                        );
                                    }

                                    // Default to moderate/yellow for other issues (pests, deficiencies, wilt, etc.)
                                    return (
                                        <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20 border-yellow-500/20 px-3 py-1">
                                            <AlertTriangle className="w-3.5 h-3.5 mr-1.5" /> Potential Risk
                                        </Badge>
                                    );
                                })()}
                            </div>
                        </div>

                        <div className="flex items-center gap-6 text-sm text-muted-foreground mt-1">
                            <div className="flex items-center gap-2" title="Total Care Logs">
                                <div className="p-1.5 bg-blue-500/10 rounded-full">
                                    <Droplets className="w-4 h-4 text-blue-500" />
                                </div>
                                <span>{logCount} Logs</span>
                            </div>

                            <div className="flex items-center gap-2" title="Date Added">
                                <div className="p-1.5 bg-orange-500/10 rounded-full">
                                    <Calendar className="w-4 h-4 text-orange-500" />
                                </div>
                                <span>Added {new Date(plant.createdAt).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </CardContent>
                </div>
            </Card>
        </Link>
    );
};
