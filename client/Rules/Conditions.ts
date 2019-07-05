export const Conditions = {
  Blinded: `<ul>
    <li>A blinded creature can’t see and automatically fails any ability check that requires sight.</li>
    <li>Attack rolls against the creature have advantage, and the creature’s Attack rolls have disadvantage.</li>
    </ul>`,
  Charmed: `<ul>
    <li>A charmed creature can’t Attack the charmer or target the charmer with harmful Abilities or magical effects.</li>
    <li>The charmer has advantage on any ability check to interact socially with the creature.</li>
    </ul>`,
  Concentrating: ``,
  Deafened: `<ul>
    <li>A deafened creature can’t hear and automatically fails any ability check that requires hearing.</li>
    </ul>`,
  Frightened: `<ul>
    <li>A frightened creature has disadvantage on Ability Checks and Attack rolls while the source of its fear is within line of sight.</li>
    <li>The creature can’t willingly move closer to the source of its fear.</li>
    </ul>`,
  Grappled: `<ul>
    <li>A grappled creature’s speed becomes 0, and it can’t benefit from any bonus to its speed.</li>
    <li>The condition ends if the Grappler is incapacitated (see the condition).</li>
    <li>The condition also ends if an effect removes the grappled creature from the reach of the Grappler or Grappling effect, such as when a creature is hurled away by the Thunderwave spell.</li>
    </ul>`,
  Incapacitated: `<ul>
    <li>An incapacitated creature can’t take actions or reactions.</li>
    </ul>`,
  Invisible: `<ul>
    <li>An invisible creature is impossible to see without the aid of magic or a Special sense. For the purpose of Hiding, the creature is heavily obscured. The creature’s location can be detected by any noise it makes or any tracks it leaves.</li>
    <li>Attack rolls against the creature have disadvantage, and the creature’s Attack rolls have advantage.</li>
    </ul>`,
  Paralyzed: `<ul>
    <li>A paralyzed creature is incapacitated (see the condition) and can’t move or speak.</li>
    <li>The creature automatically fails Strength and Dexterity saving throws.</li>
    <li>Attack rolls against the creature have advantage.</li>
    <li>Any Attack that hits the creature is a critical hit if the attacker is within 5 feet of the creature.</li>
    </ul>`,
  Petrified: `<ul>
    <li>A petrified creature is transformed, along with any nonmagical object it is wearing or carrying, into a solid inanimate substance (usually stone). Its weight increases by a factor of ten, and it ceases aging.</li>
    <li>The creature is incapacitated (see the condition), can’t move or speak, and is unaware of its surroundings.</li>
    <li>Attack rolls against the creature have advantage.</li>
    <li>The creature automatically fails Strength and Dexterity saving throws.</li>
    <li>The creature has Resistance to all damage.</li>
    <li>The creature is immune to poison and disease, although a poison or disease already in its system is suspended, not neutralized.</li>
    </ul>`,
  Poisoned: `<ul>
    <li>A poisoned creature has disadvantage on Attack rolls and Ability Checks.</li>
    </ul>`,
  Prone: `<ul>
    <li>A prone creature’s only Movement option is to crawl, unless it stands up and thereby ends the condition.</li>
    <li>The creature has disadvantage on Attack rolls.</li>
    <li>An Attack roll against the creature has advantage if the attacker is within 5 feet of the creature. Otherwise, the Attack roll has disadvantage.</li>
    </ul>`,
  Restrained: `<ul>
    <li>A restrained creature’s speed becomes 0, and it can’t benefit from any bonus to its speed.</li>
    <li>Attack rolls against the creature have advantage, and the creature’s Attack rolls have disadvantage.</li>
    <li>The creature has disadvantage on Dexterity saving throws.</li>
    </ul>`,
  Stunned: `<ul>
    <li>A stunned creature is incapacitated (see the condition), can’t move, and can speak only falteringly.</li>
    <li>The creature automatically fails Strength and Dexterity saving throws.</li>
    <li>Attack rolls against the creature have advantage.</li>
    </ul>`,
  Unconscious: `<ul>
    <li>An unconscious creature is incapacitated (see the condition), can’t move or speak, and is unaware of its surroundings.</li>
    <li>The creature drops whatever it’s holding and falls prone.</li>
    <li>The creature automatically fails Strength and Dexterity saving throws.</li>
    <li>Attack rolls against the creature have advantage.</li>
    <li>Any Attack that hits the creature is a critical hit if the attacker is within 5 feet of the creature.</li>
    </ul>`,
  Exhaustion: `<p>Some special abilities and environmental hazards, such as starvation and the long-­term effects of freezing or scorching temperatures, can lead to a special condition called exhaustion. Exhaustion is measured in six levels. An effect can give a creature one or more levels of exhaustion, as specified in the effect’s description.</p>
    <p>Table: Exhaustion Effects</p>
    <p>Level	Effect <br />
    1	Disadvantage on ability checks <br />
    2	Speed halved <br />
    3	Disadvantage on attack rolls and saving throws <br />
    4	Hit point maximum halved <br />
    5	Speed reduced to 0 <br />
    6	Death </p>
    <p>If an already exhausted creature suffers another effect that causes exhaustion, its current level of exhaustion increases by the amount specified in the effect’s description. A creature suffers the effect of its current level of exhaustion as well as all lower levels. For example, a creature suffering level 2 exhaustion has its speed halved and has disadvantage on ability checks. An effect that removes exhaustion reduces its level as specified in the effect’s description, with all exhaustion effects ending if a creature’s exhaustion level is reduced below 1. Finishing a long rest reduces a creature’s exhaustion level by 1, provided that the creature has also ingested some food and drink.</p>`
};
