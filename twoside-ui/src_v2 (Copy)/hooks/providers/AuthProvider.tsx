import { useEffect, useState, type ReactNode } from "react";
import { AuthContext } from "../useAuth";
import APIClient from "../../libs/api/cilent";
import API from "../../libs/api/api";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
	const [is_authenticated, set_is_authenticated] = useState(false);
	const [checking_session, set_checking_session] = useState(true);

	useEffect(() => {
		API.refrshSession().then((success) => {
			set_is_authenticated(success);
			set_checking_session(false);
		});
	}, []);

	useEffect(() => {
		APIClient.onUnauthorized = () => set_is_authenticated(false);
		return () => { 
			APIClient.onUnauthorized = null;
	 	}
	});

	const logout = async () => {
		await API.logout();
		set_is_authenticated(false);
	}

	if (checking_session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <span className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
	
  return (
    <AuthContext.Provider value={{ is_authenticated, logout }}>
      {children}
    </AuthContext.Provider>
  );
};