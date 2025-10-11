import Home from '../home'
import { ThemeProvider } from '@/components/theme-provider'

export default function HomeExample() {
  return (
    <ThemeProvider>
      <Home />
    </ThemeProvider>
  )
}
