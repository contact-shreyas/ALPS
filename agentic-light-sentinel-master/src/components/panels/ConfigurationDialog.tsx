"use client";

import { useState } from "react";
import { SystemHealthConfig } from "@/types/system-health";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Settings } from "lucide-react";

interface ConfigurationDialogProps {
  config: SystemHealthConfig;
  onSave: (config: SystemHealthConfig) => void;
}

export function ConfigurationDialog({ config, onSave }: ConfigurationDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [tempConfig, setTempConfig] = useState(config);

  const handleSave = () => {
    onSave(tempConfig);
    setIsOpen(false);
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="gap-2"
        onClick={() => setIsOpen(true)}
      >
        <Settings className="w-4 h-4" />
        Settings
      </Button>

      <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
        <AlertDialogContent className="sm:max-w-[425px]">
          <AlertDialogHeader>
            <AlertDialogTitle>Dashboard Configuration</AlertDialogTitle>
            <AlertDialogDescription>
              Adjust thresholds and settings for the health monitoring system.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-4">
              <h4 className="font-medium">Thresholds</h4>
              
              <div className="grid gap-2">
                <Label htmlFor="precision">Precision Threshold (%)</Label>
                <Input
                  id="precision"
                  type="number"
                  min="0"
                  max="100"
                  value={tempConfig.thresholds.precision}
                  onChange={(e) => setTempConfig({
                    ...tempConfig,
                    thresholds: {
                      ...tempConfig.thresholds,
                      precision: Number(e.target.value)
                    }
                  })}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="coverage">Coverage Threshold (%)</Label>
                <Input
                  id="coverage"
                  type="number"
                  min="0"
                  max="100"
                  value={tempConfig.thresholds.coverage}
                  onChange={(e) => setTempConfig({
                    ...tempConfig,
                    thresholds: {
                      ...tempConfig.thresholds,
                      coverage: Number(e.target.value)
                    }
                  })}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="responseTime">Response Time Threshold (ms)</Label>
                <Input
                  id="responseTime"
                  type="number"
                  min="0"
                  value={tempConfig.thresholds.responseTime}
                  onChange={(e) => setTempConfig({
                    ...tempConfig,
                    thresholds: {
                      ...tempConfig.thresholds,
                      responseTime: Number(e.target.value)
                    }
                  })}
                />
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium">Settings</h4>
              
              <div className="grid gap-2">
                <Label htmlFor="updateInterval">Update Interval (seconds)</Label>
                <Input
                  id="updateInterval"
                  type="number"
                  min="5"
                  value={tempConfig.updateInterval / 1000}
                  onChange={(e) => setTempConfig({
                    ...tempConfig,
                    updateInterval: Number(e.target.value) * 1000
                  })}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="darkMode">Dark Mode</Label>
                <Switch
                  id="darkMode"
                  checked={tempConfig.darkMode}
                  onCheckedChange={(checked) => setTempConfig({
                    ...tempConfig,
                    darkMode: checked
                  })}
                />
              </div>
            </div>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleSave}>Save Changes</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}