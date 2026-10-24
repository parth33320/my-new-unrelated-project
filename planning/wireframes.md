# Wireframes

This document details the interface layout and navigation mechanics for Tandem. Wireframes are rendered directly via Markdown/Mermaid block modules to preserve structural styling directly inside GitHub.

## List of Pages
* **Page 1: Landing / Game Setup Dashboard**
* **Page 2: Timed Game Loop Arena View** ⭐ (Wireframed Below)
* **Page 3: Dynamic Word Reveal Modal Overlay** ⭐ (Wireframed Below)
* **Page 4: Final Similarity Meter Dashboard**
* **Page 5: Custom Deck Management CRUD Dashboard** ⭐ (Wireframed Below)
* **Page 6: Split-Direction Leaderboard Page**
* **Page 7: User Authentication Gateway Page**

---

## Wireframe 1: Timed Game Loop Arena View (Feature 1)
* **Description:** The live gameplay layout featuring a persistent status tracking bar, a centrally isolated multi-language character display widget, a dynamic countdown progress line, and individual multiple-choice response nodes.
* **Owner:** George Liu (Stories 1, 2, 3, 4)

```mermaid
graph TD
    subgraph Game_Arena_Screen ["📺 VIEWPORT: /game-arena"]
        direction TB
        
        %% Top Status Navigation Bar
        subgraph Top_Nav_Bar ["Header Status Panel"]
            direction LR
            Score["🏆 Score: 350 pts"] --- Round["📋 Word: 4 / 10"] --- Direction["🔄 Mode: CN ➔ JP"]
        end

        %% Central Target Card Window
        subgraph Main_Display_Zone ["Target Word Card Workspace"]
            direction TB
            Kanji_Character["手 紙"]
            Character_Subtext["[ Identify the Japanese meaning of this common string ]"]
        end

        %% Dynamic Timer Component Bar
        subgraph Timer_Track ["Visual Countdown Bar (Feature 9)"]
            Timer_Bar["🔥 [▓▓▓▓▓▓▓▓▓▓░░░░░] 6.2s remaining"]
        end

        %% Interactive Grid Nodes
        subgraph Multiple_Choice_Grid ["Answer Input Grid Element"]
            direction TB
            subgraph Row_1 ["Top Options Row"]
                direction LR
                Btn_A["[A] Notebook"] --- Btn_B["[B] Toilet Paper"]
            end
            subgraph Row_2 ["Bottom Options Row"]
                direction LR
                Btn_C["[C] Written Letter"] --- Btn_D["[D] Wallpaper"]
            end
        end

        %% Connection Flows
        Top_Nav_Bar --> Main_Display_Zone
        Main_Display_Zone --> Timer_Track
        Timer_Track --> Multiple_Choice_Grid
    end

    %% UI Component Element Styling Configurations
    style Game_Arena_Screen fill:#fafafa,stroke:#333,stroke-width:2px;
    style Top_Nav_Bar fill:#e3f2fd,stroke:#1565c0,stroke-width:1px;
    style Main_Display_Zone fill:#fff,stroke:#b0bec5,stroke-width:2px;
    style Timer_Track fill:#fffde7,stroke:#fbc02d,stroke-width:1px;
    style Multiple_Choice_Grid fill:#f5f5f5,stroke:#9e9e9e,stroke-width:1px;
    style Row_1 fill:#f5f5f5,stroke:none;
    style Row_2 fill:#f5f5f5,stroke:none;
```

---

## Wireframe 2: Dynamic Word Reveal Modal Overlay (Feature 2)
* **Description:** The `[CUSTOM]` same-page modal viewport tracking a linguistic comparison framework layer on top of a grayed-out game arena canvas.
* **Owner:** Hunter Smith (Stories 5, 6, 7)

```mermaid
graph TD
    subgraph Modal_Container_Overlay ["🪟 MODAL OVERLAY LAYER: /game-arena#reveal"]
        direction TB

        subgraph Relationship_Banner ["Classification Header Tag"]
            Tag["🚨 Relationship Status: FALSE FRIEND"]
        end

        subgraph Breakdown_Comparison_Grid ["Side-by-Side Linguistic Breakdown View Panel"]
            direction LR
            
            subgraph Left_Column ["Chinese Data Node"]
                ZH_Head["🇨🇳 Chinese Profile"]
                ZH_Char["Character: 手紙"]
                ZH_Pinyin["Pinyin: shǒuzhǐ"]
                ZH_Def["Meaning: Toilet Paper"]
            end

            subgraph Right_Column ["Japanese Data Node"]
                JP_Head["🇯🇵 Japanese Profile"]
                JP_Char["Character: 手紙"]
                JP_Kana["Kana: てがみ (tegami)"]
                JP_Def["Meaning: Written Letter"]
            end
        end

        subgraph Notification_Workspace ["System Message Tracker (Feature 10)"]
            Toast_Message["🍞 Toast Notification: Score submitted successfully!"]
        end

        subgraph Control_Actions_Bar ["Navigation Workflow Controller"]
            Next_Btn["[ ➔ Advance to Next Word Summary ]"]
        end

        Relationship_Banner --> Breakdown_Comparison_Grid
        Breakdown_Comparison_Grid --> Notification_Workspace
        Notification_Workspace --> Control_Actions_Bar
    end

    %% Graphical Aesthetics Setup Configuration
    style Modal_Container_Overlay fill:#fff,stroke:#d32f2f,stroke-width:3px;
    style Relationship_Banner fill:#ffebee,stroke:#c62828,stroke-width:1px;
    style Left_Column fill:#f9f9f9,stroke:#e0e0e0,stroke-width:1px;
    style Right_Column fill:#f9f9f9,stroke:#e0e0e0,stroke-width:1px;
    style Notification_Workspace fill:#e8f5e9,stroke:#2e7d32,stroke-width:1px;
    style Control_Actions_Bar fill:#eceff1,stroke:#37474f,stroke-width:1px;
```

---

## Wireframe 3: Custom Deck Management CRUD Dashboard (Feature 5)
* **Description:** The authenticated user playground. Houses modular lists, deck cards, validation warnings, and creation options.
* **Owner:** Robert Cunningham (Stories 14, 15, 16, 17, 18)

```mermaid
graph TD
    subgraph Deck_CRUD_Dashboard ["🛠️ VIEWPORT: /decks-dashboard"]
        direction TB

        %% Top Control Component Row
        subgraph Panel_Header_Controls ["Global Context Row Panel"]
            Title_Dashboard["🗂️ My Custom Vocabulary Workspace"]
            Reset_Button["⚠️ [ Reset Global App Database to Default Data Model ]"]
        end

        %% Context Validation Messages
        subgraph Alert_Banner_Region ["Form Constraint Validation Engine (Story 18)"]
            Inline_Error_Message["❌ Validation Failure Notice: Deck Name Cannot Be Blank!"]
        end

        %% Creation Input Panel Widget
        subgraph Create_Deck_Form ["Form Builder: New Deck Generator (POST)"]
            Input_Label["Deck Title Input Field:"]
            Input_Box["[ Enter text string here...                        ]"]
            Submit_Form["[ ➕ Initialize & Save Collection Row ]"]
        end

        %% Saved Repositories Listing Grid
        subgraph Deck_Grid_Matrix ["Deck Collection Data Grid (One card per entity)"]
            direction LR
            
            subgraph Deck_Card_1 ["Card Row 1: My Difficult Kanji"]
                D1_Title["📁 My Difficult Kanji"]
                D1_Count["Count: 14 Words"]
                D1_Edit["[✏️ PATCH]"]
                D1_Del["[🗑️ DELETE]"]
            end

            subgraph Deck_Card_2 ["Card Row 2: False Friend Traps"]
                D2_Title["📁 False Friend Traps"]
                D2_Count["Count: 8 Words"]
                D2_Edit["[✏️ PATCH]"]
                D2_Del["[🗑️ DELETE]"]
            end
        end

        Panel_Header_Controls --> Alert_Banner_Region
        Alert_Banner_Region --> Create_Deck_Form
        Create_Deck_Form --> Deck_Grid_Matrix
    end

    %% UI Color Layout Definitions
    style Deck_CRUD_Dashboard fill:#fafafa,stroke:#333,stroke-width:2px;
    style Panel_Header_Controls fill:#eceff1,stroke:#455a64,stroke-width:1px;
    style Alert_Banner_Region fill:#fff3e0,stroke:#e65100,stroke-width:1px;
    style Create_Deck_Form fill:#fff,stroke:#b0bec5,stroke-width:1px;
    style Deck_Card_1 fill:#f9f9f9,stroke:#cfd8dc,stroke-width:1px;
    style Deck_Card_2 fill:#f9f9f9,stroke:#cfd8dc,stroke-width:1px;
```
