import {Plus} from 'lucide-react'
import StatCard from '../components/StatCard';
import ActivityCard from '../components/ActivityCard';
import { Baby, Users, UserRound, Utensils } from "lucide-react";
import { Link } from 'react-router-dom';
import RecentChild from '../components/RecentChild';
import MealCard from '../components/MealCard';
function Dashboard() {
  const today = new Date();
  const currentDay = today.toLocaleDateString("en-US", {
    weekday: "long",
    month:"long",
    day: "numeric",
    year: "numeric"
  });
  return (
    <>
    <div className='dashboard-header'>
      <div>
        <h1>Good Morning!</h1>
        <p>Here is your daily summary.</p>
      </div>
        <Link to="/registration" className='add-link'>
      <button className='add-button'>
        <Plus size={20}/>
        Register child
        </button>
        </Link> 
    </div>
    <div className='stats-grid'>
      <StatCard 
      title="Total Children"
      value= "25"
      update = "+3 this month"
      icon={Baby}
      iconColor="#D96C9D"
      />
      <StatCard 
      title="Total Parents"
      value= "25"
      update = "+2 this month"
      icon={UserRound}
      iconColor="#8B5CF6"
      />
      <StatCard 
      title="Total Staff"
      value= "25"
      update = "All Currently active"
      icon={Users}
      iconColor="#3B82F6"
      />
      <StatCard 
      title="Meals this week"
      value= "25"
      update = "6 days planned"
      icon={Utensils}
      iconColor="#0bf536"
      />
    </div>
    <div className='activity-section'>
      <div className='registration-graph'>
        <h3>Child registrations</h3>
        <p>New registrations over the last 7 months</p>
        <div className='graph'></div>
      </div>
      <div className='recent-activities'>
        <h3>Recent activity</h3>
        <p>Latest updates at the center</p>
        <div>
            <ActivityCard 
            title="New child registered"
            description="Sophie Williams joined Butterflies"
            updateTime="12 minutes ago"
            icon={Plus}
            iconColor="#D96C9D"/>
            <ActivityCard 
            title="Staff profile updated"
            description="Nina added a new certificate"
            updateTime="Yesterday"
            icon={UserRound}
            iconColor="#f729fe"/>
            <ActivityCard 
            title="Meal plan updated"
            description="Wednesday lunch was updated"
            updateTime="1 hour ago"
            icon={Utensils}
            iconColor="#0bf536"/>
        </div>
      </div>
      </div>
      <div className='info-table'>
        <div className='recent-registration'>
          <h3>Recent registrations</h3>
          <p>Children recently added to your center</p>
          <div>
             <RecentChild
              name="hanan"
              age="25"
              gender="female"
              icon={Baby}
              iconColor="#333"
              />
             <RecentChild
              name="hanan"
              age="25"
              gender="female"
              icon={Baby}
              iconColor="#333"
              />
             <RecentChild
              name="hanan"
              age="25"
              gender="female"
              icon={Baby}
              iconColor="#333"
              />
          </div>
        </div>
        <div className='today-meal'>
          <h3>Today's meals</h3>
          <p>{currentDay}</p>
          <div>
            <MealCard
              name="Berry oatmeal bowl"
              description="Oats, seasonal berries & yogurt"
              mealType="Breakfast"
              icon={Baby}
              iconColor="#333"
              />
              <MealCard
                name="Chicken & vegetable rice"
                description="With steamed broccoli and peas"
                mealType="Lunch"
                icon={Baby}
                iconColor="#333"
                />
            <MealCard
              name="Apple slices & crackers"
              description="Served with sunflower seed butter"
              mealType="Snack"
              icon={Baby}
              iconColor="#333"
              />
          </div>
        </div>
      </div>
    
    </>
  );
}
export default Dashboard;