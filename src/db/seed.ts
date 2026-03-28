import { database } from './index';
import { Community, Member, Resource, CheckIn, Drill, EmergencyPlan, Message, Achievement } from './models';

const now = Date.now();
const oneHourAgo = now - 3600000;
const oneDayAgo = now - 86400000;
const sevenDaysAgo = now - 604800000;

export async function seedDatabase(): Promise<void> {
  try {
    await database.write(async () => {
      // Create community
      const community = await database
        .get<typeof Community>('communities')
        .create((c) => {
          c.name = 'Riverside Community';
          c.passphraseHash = '$2b$10$examplehash1234567890'; // bcrypt hash of "ember2024"
          c.inviteCode = 'EMBER2024';
          c.createdAt = sevenDaysAgo;
          c.memberCount = 8;
          c.isActive = true;
        });

      // Create members with varied roles and skills
      const memberData = [
        {
          name: 'Alex Chen',
          role: 'coordinator',
          avatar: '👨‍⚕️',
          bio: 'Emergency response coordinator with 15 years experience',
          status: 'safe' as const,
          skills: JSON.stringify([
            { name: 'Emergency Response', level: 'advanced' },
            { name: 'First Aid', level: 'advanced' },
            { name: 'Team Leadership', level: 'advanced' },
          ]),
          resources: JSON.stringify([
            { name: 'First Aid Kit', quantity: 2, unit: 'unit' },
            { name: 'Emergency Radio', quantity: 1, unit: 'unit' },
          ]),
          isSelf: true,
        },
        {
          name: 'Maria Gonzalez',
          role: 'medical',
          avatar: '👩‍⚕️',
          bio: 'Registered nurse specializing in trauma care',
          status: 'safe' as const,
          skills: JSON.stringify([
            { name: 'Emergency Medical Care', level: 'advanced' },
            { name: 'Wound Treatment', level: 'advanced' },
            { name: 'CPR/AED', level: 'advanced' },
          ]),
          resources: JSON.stringify([
            { name: 'Medical Supplies', quantity: 5, unit: 'kit' },
            { name: 'Oxygen Tank', quantity: 2, unit: 'unit' },
          ]),
          isSelf: false,
        },
        {
          name: 'James Park',
          role: 'logistics',
          avatar: '📦',
          bio: 'Supply chain manager and resource coordinator',
          status: 'safe' as const,
          skills: JSON.stringify([
            { name: 'Inventory Management', level: 'advanced' },
            { name: 'Logistics', level: 'advanced' },
            { name: 'Food Storage', level: 'intermediate' },
          ]),
          resources: JSON.stringify([
            { name: 'Water Storage', quantity: 500, unit: 'gallons' },
            { name: 'Non-perishable Food', quantity: 100, unit: 'lbs' },
          ]),
          isSelf: false,
        },
        {
          name: 'Sarah Mitchell',
          role: 'communications',
          avatar: '📡',
          bio: 'Amateur radio operator and tech specialist',
          status: 'safe' as const,
          skills: JSON.stringify([
            { name: 'Amateur Radio', level: 'advanced' },
            { name: 'Network Administration', level: 'advanced' },
            { name: 'Electronics Repair', level: 'intermediate' },
          ]),
          resources: JSON.stringify([
            { name: 'CB Radio', quantity: 2, unit: 'unit' },
            { name: 'Generator', quantity: 1, unit: 'unit' },
            { name: 'Fuel', quantity: 50, unit: 'gallons' },
          ]),
          isSelf: false,
        },
        {
          name: 'David Lee',
          role: 'security',
          avatar: '🔐',
          bio: 'Security professional and perimeter specialist',
          status: 'safe' as const,
          skills: JSON.stringify([
            { name: 'Perimeter Security', level: 'advanced' },
            { name: 'Threat Assessment', level: 'advanced' },
            { name: 'Self Defense', level: 'intermediate' },
          ]),
          resources: JSON.stringify([
            { name: 'Flashlights', quantity: 8, unit: 'unit' },
            { name: 'Batteries', quantity: 48, unit: 'unit' },
          ]),
          isSelf: false,
        },
        {
          name: 'Emma Rodriguez',
          role: 'shelter',
          avatar: '🏠',
          bio: 'Housing coordinator and shelter manager',
          status: 'unknown' as const,
          skills: JSON.stringify([
            { name: 'Shelter Management', level: 'advanced' },
            { name: 'Sanitation', level: 'advanced' },
            { name: 'Heating Systems', level: 'intermediate' },
          ]),
          resources: JSON.stringify([
            { name: 'Blankets', quantity: 20, unit: 'unit' },
            { name: 'Cots', quantity: 10, unit: 'unit' },
          ]),
          isSelf: false,
        },
        {
          name: 'Thomas Wilson',
          role: 'volunteer',
          avatar: '🤝',
          bio: 'Experienced volunteer with neighborhood connections',
          status: 'safe' as const,
          skills: JSON.stringify([
            { name: 'Community Outreach', level: 'intermediate' },
            { name: 'Vehicle Maintenance', level: 'intermediate' },
            { name: 'Heavy Lifting', level: 'intermediate' },
          ]),
          resources: JSON.stringify([
            { name: 'Pickup Truck', quantity: 1, unit: 'unit' },
            { name: 'Tools', quantity: 1, unit: 'kit' },
          ]),
          isSelf: false,
        },
        {
          name: 'Jessica Kumar',
          role: 'volunteer',
          avatar: '💪',
          bio: 'Teacher and community educator',
          status: 'help' as const,
          skills: JSON.stringify([
            { name: 'Education', level: 'advanced' },
            { name: 'Child Care', level: 'advanced' },
            { name: 'Basic Cooking', level: 'intermediate' },
          ]),
          resources: JSON.stringify([
            { name: 'Educational Materials', quantity: 10, unit: 'unit' },
            { name: 'Food Prep Equipment', quantity: 1, unit: 'kit' },
          ]),
          isSelf: false,
        },
      ];

      const members = await Promise.all(
        memberData.map((m) =>
          database
            .get<typeof Member>('members')
            .create((member) => {
              member.communityId = community.id;
              member.name = m.name;
              member.role = m.role;
              member.avatar = m.avatar;
              member.bio = m.bio;
              member.status = m.status;
              member.lastCheckIn = now;
              member.skillsJson = m.skills;
              member.resourcesJson = m.resources;
              member.isSelf = m.isSelf;
            })
        )
      );

      // Create resources across categories
      const resourceData = [
        {
          category: 'Water' as const,
          name: 'Clean Water',
          quantity: 500,
          unit: 'gallons',
          critical: 100,
          max: 1000,
          icon: '💧',
        },
        {
          category: 'Water' as const,
          name: 'Water Purification Tablets',
          quantity: 150,
          unit: 'tablets',
          critical: 30,
          max: 200,
          icon: '💊',
        },
        {
          category: 'Food' as const,
          name: 'Non-perishable Food',
          quantity: 300,
          unit: 'lbs',
          critical: 75,
          max: 500,
          icon: '🥫',
        },
        {
          category: 'Food' as const,
          name: 'Baby Formula',
          quantity: 25,
          unit: 'lbs',
          critical: 10,
          max: 50,
          icon: '👶',
        },
        {
          category: 'Medical' as const,
          name: 'First Aid Kits',
          quantity: 12,
          unit: 'unit',
          critical: 3,
          max: 20,
          icon: '🏥',
        },
        {
          category: 'Medical' as const,
          name: 'Prescription Medications',
          quantity: 45,
          unit: 'unit',
          critical: 15,
          max: 100,
          icon: '💊',
        },
        {
          category: 'Power' as const,
          name: 'Generators',
          quantity: 3,
          unit: 'unit',
          critical: 1,
          max: 5,
          icon: '⚡',
        },
        {
          category: 'Power' as const,
          name: 'Fuel',
          quantity: 150,
          unit: 'gallons',
          critical: 30,
          max: 250,
          icon: '⛽',
        },
        {
          category: 'Power' as const,
          name: 'Batteries',
          quantity: 200,
          unit: 'unit',
          critical: 50,
          max: 400,
          icon: '🔋',
        },
        {
          category: 'Comms' as const,
          name: 'Radios',
          quantity: 8,
          unit: 'unit',
          critical: 2,
          max: 15,
          icon: '📻',
        },
        {
          category: 'Comms' as const,
          name: 'Satellite Phone',
          quantity: 1,
          unit: 'unit',
          critical: 1,
          max: 3,
          icon: '☎️',
        },
        {
          category: 'Comms' as const,
          name: 'Emergency Whistles',
          quantity: 25,
          unit: 'unit',
          critical: 5,
          max: 50,
          icon: '🔔',
        },
      ];

      await Promise.all(
        resourceData.map((r) =>
          database
            .get<typeof Resource>('resources')
            .create((resource) => {
              resource.communityId = community.id;
              resource.category = r.category;
              resource.name = r.name;
              resource.quantity = r.quantity;
              resource.unit = r.unit;
              resource.criticalThreshold = r.critical;
              resource.maxCapacity = r.max;
              resource.icon = r.icon;
              resource.lastUpdated = now;
              resource.updatedBy = members[0].id;
            })
        )
      );

      // Create check-ins
      const checkInData = [
        {
          memberId: members[0].id,
          status: 'safe' as const,
          timestamp: now,
          location: 'Community Center',
          note: 'All systems operational',
        },
        {
          memberId: members[1].id,
          status: 'safe' as const,
          timestamp: oneHourAgo,
          location: 'Medical Clinic',
          note: 'Medical supplies restocked',
        },
        {
          memberId: members[2].id,
          status: 'safe' as const,
          timestamp: now,
          location: 'Storage Facility',
          note: 'Inventory audit complete',
        },
        {
          memberId: members[3].id,
          status: 'safe' as const,
          timestamp: oneDayAgo,
          location: 'Communications Center',
          note: 'Radio systems functioning normally',
        },
        {
          memberId: members[4].id,
          status: 'safe' as const,
          timestamp: now,
          location: 'Perimeter',
          note: 'All clear',
        },
        {
          memberId: members[5].id,
          status: 'unknown' as const,
          timestamp: oneDayAgo,
          location: 'Shelter Building',
          note: 'No recent check-in',
        },
        {
          memberId: members[6].id,
          status: 'safe' as const,
          timestamp: oneHourAgo,
          location: 'Workshop',
          note: 'Vehicle maintenance ongoing',
        },
        {
          memberId: members[7].id,
          status: 'help' as const,
          timestamp: oneHourAgo,
          location: 'Education Center',
          note: 'Assistance needed with supplies',
        },
      ];

      await Promise.all(
        checkInData.map((c) =>
          database
            .get<typeof CheckIn>('check_ins')
            .create((checkIn) => {
              checkIn.memberId = c.memberId;
              checkIn.communityId = community.id;
              checkIn.status = c.status;
              checkIn.timestamp = c.timestamp;
              checkIn.locationEncrypted = Buffer.from(c.location).toString('base64');
              checkIn.note = c.note;
            })
        )
      );

      // Create drills
      const drillData = [
        {
          name: 'Water Distribution Drill',
          description: 'Practice efficient water distribution across the community',
          difficulty: 'medium' as const,
          time: 120,
          icon: '💧',
          xp: 250,
          completed: true,
          score: 85,
        },
        {
          name: 'Medical Emergency Response',
          description: 'Simulate mass casualty incident response',
          difficulty: 'hard' as const,
          time: 180,
          icon: '🏥',
          xp: 400,
          completed: true,
          score: 92,
        },
        {
          name: 'Communication Blackout Simulation',
          description: 'Practice mesh network communication when standard systems fail',
          difficulty: 'hard' as const,
          time: 150,
          icon: '📡',
          xp: 350,
          completed: true,
          score: 78,
        },
        {
          name: 'Shelter Setup Drill',
          description: 'Rapid deployment of emergency shelter',
          difficulty: 'easy' as const,
          time: 90,
          icon: '⛺',
          xp: 150,
          completed: false,
          score: 0,
        },
        {
          name: 'Supply Chain Management',
          description: 'Optimize resource allocation during emergency',
          difficulty: 'medium' as const,
          time: 120,
          icon: '📦',
          xp: 250,
          completed: true,
          score: 88,
        },
        {
          name: 'Neighborhood Security Patrol',
          description: 'Coordinate community safety watch',
          difficulty: 'easy' as const,
          time: 60,
          icon: '🔐',
          xp: 100,
          completed: false,
          score: 0,
        },
        {
          name: 'Community Education Program',
          description: 'Deliver emergency preparedness training to residents',
          difficulty: 'medium' as const,
          time: 180,
          icon: '📚',
          xp: 300,
          completed: true,
          score: 95,
        },
      ];

      await Promise.all(
        drillData.map((d) =>
          database
            .get<typeof Drill>('drills')
            .create((drill) => {
              drill.communityId = community.id;
              drill.name = d.name;
              drill.description = d.description;
              drill.difficulty = d.difficulty;
              drill.estimatedTime = d.time;
              drill.icon = d.icon;
              drill.xpReward = d.xp;
              drill.isCompleted = d.completed;
              drill.score = d.score;
              drill.completedAt = d.completed ? oneDayAgo : 0;
            })
        )
      );

      // Create emergency plans
      const planData = [
        {
          name: 'Flood Response Plan',
          type: 'Natural Disaster',
          content: 'Community flood response procedures and evacuation routes',
          status: 'current' as const,
        },
        {
          name: 'Medical Surge Protocol',
          type: 'Health Crisis',
          content: 'Guidelines for handling medical emergencies and patient triage',
          status: 'current' as const,
        },
        {
          name: 'Communication Failure Protocol',
          type: 'Infrastructure Failure',
          content: 'Mesh network activation and radio communication guidelines',
          status: 'current' as const,
        },
        {
          name: 'Shelter and Evacuation',
          type: 'Displacement',
          content: 'Community shelter locations, capacity, and activation procedures',
          status: 'needs_review' as const,
        },
        {
          name: 'Supply Distribution',
          type: 'Resource Management',
          content: 'Fair and efficient distribution of critical supplies',
          status: 'current' as const,
        },
        {
          name: 'Mutual Aid Network',
          type: 'Community Support',
          content: 'Neighbor-to-neighbor support coordination and resource sharing',
          status: 'current' as const,
        },
      ];

      await Promise.all(
        planData.map((p) =>
          database
            .get<typeof EmergencyPlan>('emergency_plans')
            .create((plan) => {
              plan.communityId = community.id;
              plan.name = p.name;
              plan.planType = p.type;
              plan.contentEncrypted = Buffer.from(p.content).toString('base64');
              plan.sizeBytes = p.content.length;
              plan.status = p.status;
              plan.lastUpdated = oneDayAgo;
            })
        )
      );

      // Create messages
      const messageData = [
        {
          senderId: members[0].id,
          senderName: members[0].name,
          text: 'Morning check-in: All systems green. Next drill scheduled for tomorrow at 10am.',
          type: 'system' as const,
          timestamp: oneHourAgo,
          isMesh: false,
          delivered: true,
        },
        {
          senderId: members[1].id,
          senderName: members[1].name,
          text: 'Medical supply update: First aid kits have been replenished to 12 units. Prescription meds at safe levels.',
          type: 'resource' as const,
          timestamp: oneHourAgo,
          isMesh: false,
          delivered: true,
        },
        {
          senderId: members[2].id,
          senderName: members[2].name,
          text: 'ALERT: Water storage at 500 gallons. We are good but monitoring closely. Please conserve where possible.',
          type: 'broadcast' as const,
          timestamp: now - 1800000,
          isMesh: false,
          delivered: true,
        },
        {
          senderId: members[3].id,
          senderName: members[3].name,
          text: 'Radio systems test at 14:00 UTC. All stations should report in.',
          type: 'system' as const,
          timestamp: now - 2700000,
          isMesh: false,
          delivered: true,
        },
        {
          senderId: members[4].id,
          senderName: members[4].name,
          text: 'Community is looking great! Thanks everyone for the excellent turnout at last weeks drill.',
          type: 'social' as const,
          timestamp: sevenDaysAgo + 86400000,
          isMesh: false,
          delivered: true,
        },
        {
          senderId: members[6].id,
          senderName: members[6].name,
          text: 'The pickup truck is ready for emergency transport. Regular maintenance completed.',
          type: 'resource' as const,
          timestamp: oneDayAgo + 3600000,
          isMesh: false,
          delivered: true,
        },
        {
          senderId: members[5].id,
          senderName: members[5].name,
          text: 'Shelter building inspections complete. All cots and blankets accounted for.',
          type: 'broadcast' as const,
          timestamp: oneDayAgo,
          isMesh: true,
          delivered: true,
        },
        {
          senderId: members[7].id,
          senderName: members[7].name,
          text: 'Can anyone spare extra food supplies? Running low at home due to unexpected guests.',
          type: 'social' as const,
          timestamp: oneHourAgo,
          isMesh: false,
          delivered: true,
        },
      ];

      await Promise.all(
        messageData.map((m) =>
          database
            .get<typeof Message>('messages')
            .create((message) => {
              message.communityId = community.id;
              message.senderId = m.senderId;
              message.senderName = m.senderName;
              message.textEncrypted = Buffer.from(m.text).toString('base64');
              message.messageType = m.type;
              message.timestamp = m.timestamp;
              message.isMesh = m.isMesh;
              message.delivered = m.delivered;
            })
        )
      );

      // Create achievements
      const achievementData = [
        {
          memberId: members[0].id,
          name: 'Emergency Coordinator',
          description: 'Completed all coordination drills',
          icon: '👨‍⚕️',
          earned: true,
        },
        {
          memberId: members[0].id,
          name: 'Community Leader',
          description: 'Led 5 community meetings',
          icon: '🏆',
          earned: true,
        },
        {
          memberId: members[1].id,
          name: 'Medical Expert',
          description: 'Completed medical emergency response drill',
          icon: '🏥',
          earned: true,
        },
        {
          memberId: members[2].id,
          name: 'Supply Master',
          description: 'Managed 500+ units of resources',
          icon: '📦',
          earned: true,
        },
        {
          memberId: members[3].id,
          name: 'Communications Pro',
          description: 'Established mesh network',
          icon: '📡',
          earned: true,
        },
        {
          memberId: members[3].id,
          name: 'Tech Pioneer',
          description: 'Set up backup communication systems',
          icon: '🔧',
          earned: false,
        },
        {
          memberId: members[4].id,
          name: 'Guardian',
          description: 'Completed security patrol drill',
          icon: '🔐',
          earned: true,
        },
        {
          memberId: members[5].id,
          name: 'Shelter Specialist',
          description: 'Managed emergency shelter setup',
          icon: '⛺',
          earned: false,
        },
        {
          memberId: members[6].id,
          name: 'Logistics Expert',
          description: 'Managed vehicle and supply logistics',
          icon: '🚚',
          earned: true,
        },
        {
          memberId: members[7].id,
          name: 'Educator',
          description: 'Taught community preparedness class',
          icon: '📚',
          earned: true,
        },
        {
          memberId: members[7].id,
          name: 'Contributor',
          description: 'Shared resources with community',
          icon: '🤝',
          earned: false,
        },
      ];

      await Promise.all(
        achievementData.map((a) =>
          database
            .get<typeof Achievement>('achievements')
            .create((achievement) => {
              achievement.memberId = a.memberId;
              achievement.name = a.name;
              achievement.description = a.description;
              achievement.icon = a.icon;
              achievement.earned = a.earned;
              achievement.earnedAt = a.earned ? oneDayAgo : 0;
            })
        )
      );

      console.log('Database seeded successfully');
    });
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
}
