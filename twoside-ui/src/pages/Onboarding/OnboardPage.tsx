import { AuthShell } from "@/pages/Auth/AuthShell";
import { OnboardForm } from "./OnboardForm";
import { motion } from "framer-motion";
import { useState } from "react";

export function OnboardPage() {
	const [error_message, setErrorMessage] = useState<string | null>(null);
	
  return (
 		<motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
	    <AuthShell 
				headline="Let's have your preferences, shall we?"
				is_error={!!error_message}
        error_message={error_message ?? undefined}
        onDismissError={() => setErrorMessage(null)}
			>
	      <OnboardForm
					onError={setErrorMessage}
          onClearError={() => setErrorMessage(null)}
        />
	    </AuthShell>
    </motion.div>
  );
};