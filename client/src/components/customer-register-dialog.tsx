import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { UserPlus, Mail, Lock, User, AlertTriangle, Copy, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface CustomerRegisterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function CustomerRegisterDialog({ open, onOpenChange, onSuccess }: CustomerRegisterDialogProps) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showSeedPhrase, setShowSeedPhrase] = useState(false);
  const [seedPhrase, setSeedPhrase] = useState("");
  const [seedPhraseCopied, setSeedPhraseCopied] = useState(false);
  const [xrpAddress, setXrpAddress] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const { toast } = useToast();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsRegistering(true);

    try {
      const response = await fetch("/api/customer/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Registration failed");
      }

      const data = await response.json();
      
      // Show seed phrase dialog
      setSeedPhrase(data.wallet.seedPhrase);
      setXrpAddress(data.wallet.xrpAddress);
      setShowSeedPhrase(true);
    } catch (error) {
      toast({
        title: "Registration failed",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
      setIsRegistering(false);
    }
  };

  const handleCopySeedPhrase = () => {
    navigator.clipboard.writeText(seedPhrase);
    setSeedPhraseCopied(true);
    toast({
      title: "Copied!",
      description: "Seed phrase copied to clipboard",
    });
    setTimeout(() => setSeedPhraseCopied(false), 2000);
  };

  const handleConfirmSeedPhrase = () => {
    toast({
      title: "Welcome!",
      description: "Your account and wallet have been created successfully",
    });
    onSuccess();
    onOpenChange(false);
    // Reset state
    setShowSeedPhrase(false);
    setSeedPhrase("");
    setXrpAddress("");
    setSeedPhraseCopied(false);
    setIsRegistering(false);
    setFormData({ name: "", email: "", password: "" });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsRegistering(true);

    try {
      const response = await fetch("/api/customer/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Login failed");
      }

      toast({
        title: "Welcome back!",
        description: "You've been logged in successfully",
      });

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Login failed",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsRegistering(false);
    }
  };

  if (showSeedPhrase) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-[calc(100%-2rem)] sm:max-w-lg">
          <DialogHeader>
            <div className="mx-auto w-12 h-12 rounded-full bg-chart-3/10 flex items-center justify-center mb-2">
              <CheckCircle2 className="w-6 h-6 text-chart-3" />
            </div>
            <DialogTitle className="text-center font-display text-2xl">
              Wallet Created Successfully!
            </DialogTitle>
            <DialogDescription className="text-center">
              Your XRP wallet has been generated. Save your seed phrase now.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 sm:space-y-4 mt-4">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Critical: Save Your Seed Phrase</AlertTitle>
              <AlertDescription className="text-sm">
                This is the ONLY time you'll see this seed phrase. Write it down and store it safely. 
                Anyone with this phrase can access your wallet and NFTs.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label>Your XRP Wallet Address</Label>
              <div className="p-2.5 sm:p-3 bg-muted rounded-md font-mono text-xs sm:text-sm break-all">
                {xrpAddress}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Your 24-Word Seed Phrase</Label>
              <div className="p-3 sm:p-4 bg-muted rounded-md border-2 border-destructive/50">
                <p className="font-mono text-xs sm:text-sm leading-relaxed break-words">
                  {seedPhrase}
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={handleCopySeedPhrase}
                className="w-full gap-2"
                data-testid="button-copy-seed"
              >
                {seedPhraseCopied ? (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    Copy Seed Phrase
                  </>
                )}
              </Button>
            </div>

            <Alert>
              <AlertDescription className="text-xs space-y-1.5 sm:space-y-2">
                <p className="font-semibold">⚠️ Security Checklist:</p>
                <ul className="list-disc list-inside space-y-0.5 sm:space-y-1">
                  <li>Write down your seed phrase on paper</li>
                  <li>Store it in a secure location (safe, vault)</li>
                  <li>Never share it with anyone</li>
                  <li>We've encrypted a backup, but you control the keys</li>
                </ul>
              </AlertDescription>
            </Alert>

            <Button
              onClick={handleConfirmSeedPhrase}
              className="w-full"
              data-testid="button-confirm-seed"
            >
              I've Saved My Seed Phrase - Continue
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[calc(100%-2rem)] sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
            <UserPlus className="w-6 h-6 text-primary" />
          </div>
          <DialogTitle className="text-center font-display text-2xl">
            {showLogin ? "Welcome Back" : "Join NFT Streetwear"}
          </DialogTitle>
          <DialogDescription className="text-center">
            {showLogin
              ? "Sign in to your account to continue"
              : "Create your account and get a free XRP wallet"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={showLogin ? handleLogin : handleRegister} className="space-y-3 sm:space-y-4 mt-4">
          {!showLogin && (
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="name"
                  placeholder="Your name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="pl-10"
                  required
                  data-testid="input-register-name"
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="pl-10"
                required
                data-testid="input-register-email"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password *</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="pl-10"
                required
                data-testid="input-register-password"
              />
            </div>
          </div>

          {!showLogin && (
            <Alert>
              <AlertDescription className="text-xs">
                We'll automatically create a secure XRP wallet for you. You'll receive a 24-word seed phrase to keep safe.
              </AlertDescription>
            </Alert>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={isRegistering}
            data-testid="button-register-submit"
          >
            {isRegistering ? "Please wait..." : showLogin ? "Sign In" : "Create Account & Wallet"}
          </Button>

          <div className="text-center">
            <button
              type="button"
              onClick={() => setShowLogin(!showLogin)}
              className="text-sm text-primary hover:underline"
              data-testid="button-toggle-login"
            >
              {showLogin ? "Don't have an account? Register" : "Already have an account? Sign in"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
