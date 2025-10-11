import Admin from '../admin'
import { ThemeProvider } from '@/components/theme-provider'

export default function AdminExample() {
  return (
    <ThemeProvider>
      <Admin />
    </ThemeProvider>
  )
}
