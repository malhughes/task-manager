import { useState, useEffect } from 'react';
import KanbanBoard from '../components/KanbanBoard';
import PageTransition from '../components/PageTransition';

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate page load time for smooth transition
    const timer = setTimeout(() => {
      setLoading(false);
    }, 300);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <PageTransition loading={loading}>
      <KanbanBoard />
    </PageTransition>
  );
}
