# Tests Unitaires pour D&D Combat Tracker

Ce dossier contient les tests unitaires pour l'application D&D Combat Tracker. Les tests sont organisés par type de composant et utilisent Vitest comme framework de test.

## Structure des tests

```
src/__tests__/
├── components/
│   ├── initiative/
│   │   └── InitiativeOrder.test.ts
│   ├── monsters/
│   │   ├── MonsterCard.test.ts
│   │   ├── MonsterList.test.ts
│   │   └── MonsterStats.test.ts
│   └── players/
│       ├── PlayerCard.test.ts
│       ├── PlayerForm.test.ts
│       └── PlayerList.test.ts
├── stores/
│   ├── monster.test.ts
│   └── player.test.ts
└── setup.ts
```

## Exécution des tests

Pour exécuter tous les tests :

```bash
npm test
```

Pour exécuter les tests en mode watch (utile pendant le développement) :

```bash
npm run test:watch
```

Pour exécuter un fichier de test spécifique :

```bash
npm test -- src/__tests__/stores/monster.test.ts
```

## Écriture de nouveaux tests

Lorsque vous ajoutez de nouvelles fonctionnalités à l'application, assurez-vous d'ajouter également des tests unitaires correspondants. Voici quelques conseils pour écrire de bons tests :

1. **Testez les comportements, pas l'implémentation** : Concentrez-vous sur ce que le composant doit faire, pas sur comment il le fait.
2. **Utilisez des données de test réalistes** : Créez des données de test qui ressemblent à celles que l'utilisateur manipulera.
3. **Isolez vos tests** : Chaque test doit être indépendant des autres. Utilisez `beforeEach` pour réinitialiser l'état entre les tests.
4. **Moquez les dépendances externes** : Utilisez des mocks pour les API, les stores, etc.

## Exemple de test

```typescript
import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import MyComponent from '../components/MyComponent.vue'

describe('MyComponent', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('renders correctly', () => {
    const wrapper = mount(MyComponent)
    expect(wrapper.text()).toContain('Expected Text')
  })

  it('responds to user interaction', async () => {
    const wrapper = mount(MyComponent)
    await wrapper.find('button').trigger('click')
    expect(wrapper.emitted('my-event')).toBeTruthy()
  })
})
```

## Résolution des problèmes courants

- **Les tests échouent avec "Cannot read properties of undefined"** : Assurez-vous que tous les props requis sont fournis lors du montage du composant.
- **Les tests échouent avec "Cannot call trigger on an empty DOMWrapper"** : Vérifiez que le sélecteur utilisé pour trouver l'élément est correct.
- **Les tests échouent avec "Missing required prop"** : Vérifiez que tous les props requis sont fournis lors du montage du composant.

## Ressources utiles

- [Documentation de Vitest](https://vitest.dev/)
- [Documentation de Vue Test Utils](https://test-utils.vuejs.org/)
- [Documentation de Pinia Testing](https://pinia.vuejs.org/cookbook/testing.html)
