import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export interface GameSettings {
  simultaneousMode: boolean;
}

interface GameSettingsProps {
  settings: GameSettings;
  onSettingsChange: (settings: GameSettings) => void;
  disabled?: boolean;
}

const GameSettings = ({ settings, onSettingsChange, disabled = false }: GameSettingsProps) => {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Game Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <label className="text-sm font-medium">Simultaneous Bidding</label>
            <p className="text-sm text-gray-500">
              All players bid at once instead of taking turns
            </p>
          </div>
          <Switch
            checked={settings.simultaneousMode}
            // @ts-ignore
            onCheckedChange={(checked) => 
              onSettingsChange({ ...settings, simultaneousMode: checked })}
            disabled={disabled}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default GameSettings;