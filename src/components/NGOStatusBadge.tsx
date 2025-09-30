import React from 'react'
import { CheckCircle, XCircle, Clock } from 'lucide-react'

interface NGOStatusBadgeProps {
  status: 'pending' | 'approved' | 'rejected'
  className?: string
}

const NGOStatusBadge: React.FC<NGOStatusBadgeProps> = ({ status, className = '' }) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'approved':
        return {
          icon: CheckCircle,
          text: 'Approved',
          bgColor: 'bg-green-100',
          textColor: 'text-green-800',
          iconColor: 'text-green-600'
        }
      case 'rejected':
        return {
          icon: XCircle,
          text: 'Rejected',
          bgColor: 'bg-red-100',
          textColor: 'text-red-800',
          iconColor: 'text-red-600'
        }
      case 'pending':
      default:
        return {
          icon: Clock,
          text: 'Pending Review',
          bgColor: 'bg-yellow-100',
          textColor: 'text-yellow-800',
          iconColor: 'text-yellow-600'
        }
    }
  }

  const config = getStatusConfig()
  const Icon = config.icon

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bgColor} ${config.textColor} ${className}`}>
      <Icon className={`w-3 h-3 mr-1 ${config.iconColor}`} />
      {config.text}
    </span>
  )
}

export default NGOStatusBadge
