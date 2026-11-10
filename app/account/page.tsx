'use client';
import { useEffect } from 'react';
import { useAuthPopup } from '@/components/auth-popup';
import { UserRound } from 'lucide-react';

export default function Account() {
  const { open } = useAuthPopup();
  useEffect(() => { open(); }, []);
  return <main id="main" className="section section-paper"><div className="container"><div className="empty-state"><UserRound size={36} /><p className="eyebrow">Prakruthi Aqua members</p><h1>Your account.</h1><p className="muted">Sign in or register to join our aquarium community.</p><button className="btn btn-dark" onClick={open}>Sign In / Register</button></div></div></main>;
}
