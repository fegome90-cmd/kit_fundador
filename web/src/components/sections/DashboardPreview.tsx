import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const data = [
  { name: 'Jan', users: 400, revenue: 2400 },
  { name: 'Feb', users: 300, revenue: 1398 },
  { name: 'Mar', users: 200, revenue: 9800 },
  { name: 'Apr', users: 278, revenue: 3908 },
  { name: 'May', users: 189, revenue: 4800 },
  { name: 'Jun', users: 239, revenue: 3800 },
  { name: 'Jul', users: 349, revenue: 4300 },
]

export function DashboardPreview() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Built-in Analytics</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Visualize your data with pre-configured charts and dashboard components.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Revenue Growth</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="name" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}
                      itemStyle={{ color: 'hsl(var(--foreground))' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="hsl(var(--primary))" 
                      fillOpacity={1} 
                      fill="url(#colorRevenue)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
                <div className="text-2xl font-bold">12,345</div>
              </CardHeader>
              <CardContent>
                <div className="text-xs text-green-500 flex items-center">
                  +12% from last month
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground">Active Sessions</CardTitle>
                <div className="text-2xl font-bold">573</div>
              </CardHeader>
              <CardContent>
                <div className="text-xs text-green-500 flex items-center">
                  +4% from last hour
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground">Conversion Rate</CardTitle>
                <div className="text-2xl font-bold">3.2%</div>
              </CardHeader>
              <CardContent>
                <div className="text-xs text-red-500 flex items-center">
                  -0.1% from last week
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  )
}
