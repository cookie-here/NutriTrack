# NutriTrack System Diagrams

This document collects the main diagrams for NutriTrack in one place. The styling is intentionally clean and health-focused, with a green-and-gold palette that matches the product's nutrition and family-care theme.

## 1. Block Diagram

```mermaid
%%{init: {
  "theme": "base",
  "themeVariables": {
    "fontFamily": "Inter, Segoe UI, Arial, sans-serif",
    "primaryColor": "#E8F5F1",
    "primaryTextColor": "#14322E",
    "primaryBorderColor": "#3A7D6D",
    "lineColor": "#6B7D78",
    "secondaryColor": "#FFF4D6",
    "tertiaryColor": "#F7FAF9",
    "clusterBkg": "#F5FBF9",
    "clusterBorder": "#B8D6CF",
    "background": "transparent"
  },
  "flowchart": { "curve": "basis" }
}}%%
flowchart TB
  User([Parent / Guardian])

  subgraph Client[Client Layer]
    Web["Frontend App\nReact + Vite + Capacitor"]
  end

  subgraph App[Application Layer]
    Routes["Express Routes"]
    Auth["Auth Middleware"]
    Controllers["Controllers\nAuth, Baby, Growth, Reminder, Profile, Vaccine, Food, Feeding"]
  end

  subgraph Data[Data Layer]
    Models["Sequelize Models"]
    Database[("SQLite / MySQL")]
  end

  subgraph Content[Reference Content]
    Static["Static Nutrition & Vaccine Content"]
    Feeds["Feeding Guidance"]
    Foods["Food Library"]
    Vaccines["Vaccine Schedule"]
  end

  User --> Web
  Web -->|REST / JSON| Routes
  Routes --> Auth
  Auth --> Controllers
  Controllers --> Models
  Models --> Database
  Controllers --> Static
  Static --> Feeds
  Static --> Foods
  Static --> Vaccines

  classDef actor fill:#FFF4D6,stroke:#B08A1F,color:#4A3700,stroke-width:1.5px;
  classDef client fill:#E8F5F1,stroke:#3A7D6D,color:#14322E,stroke-width:1.5px;
  classDef app fill:#F5FBF9,stroke:#7DB3A6,color:#183B35,stroke-width:1.2px;
  classDef data fill:#EEF3F2,stroke:#6B7D78,color:#20312F,stroke-width:1.2px;
  classDef content fill:#FFF9EA,stroke:#D4A72C,color:#4A3A06,stroke-width:1.2px;

  class User actor;
  class Web client;
  class Routes,Auth,Controllers app;
  class Models,Database data;
  class Static,Feeds,Foods,Vaccines content;
```

## 2. Scenario Based Analysis - Use Case Diagram

```mermaid
%%{init: {
  "theme": "base",
  "themeVariables": {
    "fontFamily": "Inter, Segoe UI, Arial, sans-serif",
    "primaryColor": "#E8F5F1",
    "primaryTextColor": "#14322E",
    "primaryBorderColor": "#3A7D6D",
    "lineColor": "#6B7D78",
    "secondaryColor": "#FFF4D6",
    "tertiaryColor": "#F7FAF9",
    "background": "transparent",
    "clusterBkg": "#F5FBF9",
    "clusterBorder": "#B8D6CF"
  }
}}%%
flowchart TB
  Parent([Parent / Guardian])
  Partner([Partner])

  subgraph System[NutriTrack System]
    direction TB
    UC1([Sign in / manage account])
    UC2([Manage baby profile])
    UC3([Track growth and reminders])
    UC4([View feeding and vaccine guidance])
    UC5([Invite or accept partner access])
  end

  Parent --> UC1
  Parent --> UC2
  Parent --> UC3
  Parent --> UC4
  Parent --> UC5
  Partner --> UC5

  UC5 -. shared access .-> UC2
  UC3 -. reminders .-> UC4

  classDef actor fill:#FFF4D6,stroke:#B08A1F,color:#4A3700,stroke-width:1.6px;
  classDef usecase fill:#F5FBF9,stroke:#3A7D6D,color:#183B35,stroke-width:1.2px;

  class Parent,Partner actor;
  class UC1,UC2,UC3,UC4,UC5 usecase;
```

## 3. Behavioral Analysis - State Chart Diagram

```mermaid
%%{init: {
  "theme": "base",
  "themeVariables": {
    "fontFamily": "Inter, Segoe UI, Arial, sans-serif",
    "primaryColor": "#E8F5F1",
    "primaryTextColor": "#14322E",
    "primaryBorderColor": "#3A7D6D",
    "lineColor": "#6B7D78",
    "secondaryColor": "#FFF4D6",
    "tertiaryColor": "#F7FAF9",
    "background": "transparent"
  },
  "state": { "nodeSpacing": 28, "rankSpacing": 30 }
}}%%
stateDiagram-v2
  [*] --> LoggedOut

  LoggedOut --> Authenticating: sign in / register
  Authenticating --> Dashboard: auth success
  Authenticating --> LoggedOut: auth failed

  Dashboard --> EditingBaby: update baby profile
  Dashboard --> RecordingGrowth: add growth record
  Dashboard --> ManagingReminders: create or complete reminder
  Dashboard --> ViewingGuidance: open guidance
  Dashboard --> LoggedOut: sign out

  EditingBaby --> Dashboard: save changes
  RecordingGrowth --> Dashboard: save record
  ManagingReminders --> Dashboard: save reminder
  ViewingGuidance --> Dashboard: close guidance

  ManagingReminders --> NotificationReady: reminder due
  NotificationReady --> Dashboard: notify parent

  state Dashboard {
    [*] --> HomeView
    HomeView --> HomeView: browse home
  }

  classDef stateNode fill:#F5FBF9,stroke:#3A7D6D,color:#183B35,stroke-width:1.2px;

  class LoggedOut,Authenticating,Dashboard,EditingBaby,RecordingGrowth,ManagingReminders,ViewingGuidance,NotificationReady stateNode;
```

## 4. Class Diagram

```mermaid
classDiagram
direction LR

class User {
  +int id
  +string email
  +string hashed_password
  +string full_name
  +string due_date
  +string user_type
  +string baby_date_of_birth
  +string provider
  +string provider_id
  +string picture_url
}

class Baby {
  +int id
  +int user_id
  +string name
  +date date_of_birth
  +string gender
  +float weight_at_birth_kg
  +float height_at_birth_cm
  +float head_circumference_at_birth_cm
  +string blood_type
  +text allergies
  +text notes
  +boolean is_active
}

class GrowthRecord {
  +int id
  +int user_id
  +int baby_id
  +date date
  +int age_months
  +float weight_kg
  +float height_cm
  +float head_circumference_cm
}

class Reminder {
  +int id
  +int user_id
  +int baby_id
  +string title
  +string reminder_date
  +string type
  +boolean completed
  +string status
  +string recipient
  +int dose_number
  +int total_doses
}

class EmergencyContact {
  +int id
  +int user_id
  +string name
  +string phone
  +string relationship
}

class Partner {
  +int id
  +int user_id
  +string partner_email
  +int partner_id
  +string status
}

class Vaccine {
  +int id
  +string name
  +string emoji
  +text description
  +int total_doses
  +string recipient_type
  +boolean recommended
}

class Feeding {
  +int id
  +string title
  +string emoji
  +string age_group
  +int age_months_min
  +int age_months_max
  +string type
  +string frequency
  +string amount
}

class Food {
  +int id
  +string name
  +string emoji
  +string category
  +text description
  +string type
  +string trimester
}

User "1" --> "many" Baby : owns
User "1" --> "many" GrowthRecord : records
User "1" --> "many" Reminder : creates
User "1" --> "0..1" EmergencyContact : has
User "1" --> "0..1" Partner : invites
Partner "0..1" --> "1" User : linked account
Baby "1" --> "many" GrowthRecord : measured by
Baby "1" --> "many" Reminder : scheduled for
GrowthRecord "many" --> "1" Baby : belongs to
Reminder "many" --> "0..1" Baby : optional baby link

note for Feeding "Reference content only; no database association"
note for Food "Reference content only; no database association"
note for Vaccine "Reference content only; no database association"
```

## 5. Context Diagram

```mermaid
%%{init: {
  "theme": "base",
  "themeVariables": {
    "fontFamily": "Inter, Segoe UI, Arial, sans-serif",
    "primaryColor": "#E8F5F1",
    "primaryTextColor": "#14322E",
    "primaryBorderColor": "#3A7D6D",
    "lineColor": "#6B7D78",
    "secondaryColor": "#FFF4D6",
    "tertiaryColor": "#F7FAF9",
    "background": "transparent"
  },
  "flowchart": { "curve": "basis" }
}}%%
flowchart LR
  Parent([Parent / Guardian])
  Partner([Partner])
  System((NutriTrack System))

  Parent -->|Register, sign in, manage baby data, track health| System
  System -->|Profiles, reminders, guidance, growth insights| Parent

  Partner -->|Accept or decline invitation| System
  System -->|Partner invitation and shared access updates| Partner

  classDef actor fill:#FFF4D6,stroke:#B08A1F,color:#4A3700,stroke-width:1.5px;
  classDef system fill:#E8F5F1,stroke:#3A7D6D,color:#14322E,stroke-width:1.7px;

  class Parent,Partner actor;
  class System system;
```

## 6. Level 0 DFD

```mermaid
%%{init: {
  "theme": "base",
  "themeVariables": {
    "fontFamily": "Inter, Segoe UI, Arial, sans-serif",
    "primaryColor": "#E8F5F1",
    "primaryTextColor": "#14322E",
    "primaryBorderColor": "#3A7D6D",
    "lineColor": "#6B7D78",
    "secondaryColor": "#FFF4D6",
    "tertiaryColor": "#F7FAF9",
    "background": "transparent"
  },
  "flowchart": { "curve": "basis" }
}}%%
flowchart LR
  Parent([Parent / Guardian])
  Partner([Partner])

  P1((1. Account and profile management))
  P2((2. Baby and family records))
  P3((3. Growth, reminders, and notifications))
  P4((4. Health guidance and reference content))

  D1[(Users)]
  D2[(Babies)]
  D3[(Growth Records)]
  D4[(Reminders)]
  D5[(Emergency Contacts)]
  D6[(Partners)]
  D7[(Vaccines)]
  D8[(Feedings)]
  D9[(Foods)]

  Parent --> P1
  Parent --> P2
  Parent --> P3
  Parent --> P4
  Partner --> P1

  P1 <--> D1
  P1 <--> D5
  P1 <--> D6

  P2 <--> D2
  P2 <--> D3

  P3 <--> D3
  P3 <--> D4

  P4 <--> D7
  P4 <--> D8
  P4 <--> D9

  classDef actor fill:#FFF4D6,stroke:#B08A1F,color:#4A3700,stroke-width:1.5px;
  classDef process fill:#E8F5F1,stroke:#3A7D6D,color:#14322E,stroke-width:1.5px;
  classDef store fill:#EEF3F2,stroke:#6B7D78,color:#20312F,stroke-width:1.2px;

  class Parent,Partner actor;
  class P1,P2,P3,P4 process;
  class D1,D2,D3,D4,D5,D6,D7,D8,D9 store;
```

## 7. Level 1 DFD

```mermaid
%%{init: {
  "theme": "base",
  "themeVariables": {
    "fontFamily": "Inter, Segoe UI, Arial, sans-serif",
    "primaryColor": "#E8F5F1",
    "primaryTextColor": "#14322E",
    "primaryBorderColor": "#3A7D6D",
    "lineColor": "#6B7D78",
    "secondaryColor": "#FFF4D6",
    "tertiaryColor": "#F7FAF9",
    "background": "transparent"
  },
  "flowchart": { "curve": "basis" }
}}%%
flowchart LR
  Parent([Parent / Guardian])
  Partner([Partner])

  subgraph A[1.0 Account and Profile Management]
    P11((1.1 Authenticate user))
    P12((1.2 Manage profile details))
    P13((1.3 Manage emergency contact))
    P14((1.4 Manage partner invitation))
  end

  subgraph B[2.0 Baby and Family Records]
    P21((2.1 Add baby profile))
    P22((2.2 Update baby information))
    P23((2.3 Maintain family relationships))
  end

  subgraph C[3.0 Growth, Reminders, and Notifications]
    P31((3.1 Record growth measurement))
    P32((3.2 Create or update reminder))
    P33((3.3 Mark reminder complete))
    P34((3.4 Generate user notification))
  end

  subgraph D[4.0 Health Guidance and Reference Content]
    P41((4.1 Retrieve vaccine guidance))
    P42((4.2 Retrieve feeding guidance))
    P43((4.3 Retrieve food guidance))
  end

  D1[(Users)]
  D2[(Babies)]
  D3[(Growth Records)]
  D4[(Reminders)]
  D5[(Emergency Contacts)]
  D6[(Partners)]
  D7[(Vaccines)]
  D8[(Feedings)]
  D9[(Foods)]

  Parent --> P11
  Parent --> P12
  Parent --> P13
  Parent --> P14
  Parent --> P21
  Parent --> P22
  Parent --> P23
  Parent --> P31
  Parent --> P32
  Parent --> P33
  Parent --> P41
  Parent --> P42
  Parent --> P43
  Partner --> P14

  P11 <--> D1
  P12 <--> D1
  P13 <--> D5
  P14 <--> D6

  P21 <--> D2
  P22 <--> D2
  P23 <--> D6

  P31 <--> D3
  P32 <--> D4
  P33 <--> D4
  P34 <--> D4

  P41 <--> D7
  P42 <--> D8
  P43 <--> D9

  classDef actor fill:#FFF4D6,stroke:#B08A1F,color:#4A3700,stroke-width:1.5px;
  classDef process fill:#E8F5F1,stroke:#3A7D6D,color:#14322E,stroke-width:1.5px;
  classDef store fill:#EEF3F2,stroke:#6B7D78,color:#20312F,stroke-width:1.2px;
  classDef group fill:#F7FAF9,stroke:#B8D6CF,color:#183B35,stroke-width:1px,stroke-dasharray:4 3;

  class Parent,Partner actor;
  class P11,P12,P13,P14,P21,P22,P23,P31,P32,P33,P34,P41,P42,P43 process;
  class D1,D2,D3,D4,D5,D6,D7,D8,D9 store;
  class A,B,C,D group;
```

## 8. Sequence Diagram

```mermaid
sequenceDiagram
  autonumber
  actor Parent as Parent / Guardian
  participant UI as React Frontend
  participant API as Express API
  participant MW as Auth Middleware
  participant Ctrl as Growth Controller
  participant Model as GrowthRecord Model
  participant DB as SQL Database

  Parent->>UI: Enter a new growth measurement
  UI->>API: POST /api/growth/records
  API->>MW: Validate JWT access token
  MW-->>API: Token approved
  API->>Ctrl: createGrowthRecord()
  Ctrl->>Model: Build growth record payload
  Model->>DB: INSERT into growth_records
  DB-->>Model: Persisted record
  Model-->>Ctrl: Created record
  Ctrl-->>API: 201 Created + JSON payload
  API-->>UI: Updated growth record response
  UI-->>Parent: Refresh growth timeline and charts
```

## Notes

- The backend can run on SQLite in local development or MySQL in production-like deployments.
- The diagrams emphasize the project’s actual domain objects and API flows rather than generic placeholders.
- Mermaid rendering will look best in a Markdown viewer that supports the class, flowchart, state, and sequence diagram syntax used above.