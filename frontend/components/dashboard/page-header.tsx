import { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  actions?: ReactNode;
}

export function PageHeader({ 
  title, 
  description, 
  icon, 
  actions 
}: PageHeaderProps) {
  return (
    <div className="flex items-start justify-between">
      <div className="flex gap-4 items-center">
        {icon && (
          <div className="p-2 bg-background border rounded-lg hidden sm:flex">
            {icon}
          </div>
        )}
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          {description && <p className="text-muted-foreground">{description}</p>}
        </div>
      </div>
      {actions && (
        <div className="flex items-center gap-2">
          {actions}
        </div>
      )}
    </div>
  );
} 