# Uso de Inteligência Artificial

**Projeto:** A Grande Família · Global Solution 2026.2 · CitizenTech
**Disciplina:** Web Development | Front-end Dinâmico

## Ferramentas usadas
| Ferramenta | Para quê |
|---|---|
| Claude (chat) | Revisar o código, encontrar bugs e sugerir melhorias de organização |
| Claude Code | Gerar o código do `scriptfamilia.js` a partir do desenho feito pela equipe |

## Onde a IA foi usada

### `js/script.js` (escrito pela equipe, revisado com IA)
O código foi escrito pela equipe. A IA foi usada para:
- analisar o código e apontar trechos confusos ou repetidos;
- deixar o código mais limpo (nomes de variáveis, funções e comentários);
- conferir se as listas e os elementos do DOM estavam sendo criados e selecionados corretamente;
- procurar bugs antes da entrega;
- verificar se o código do menu estava limpo e funcionando.

**Prompts usados:**
1. "Analise este código JavaScript e diga se tem bugs ou trechos que podem dar erro."
2. "Como deixar este código mais limpo e organizado, sem usar frameworks?"
3. "Estou criando listas e elementos com o DOM. Confere se está do jeito certo?"
4. "O código do menu está limpo e correto? O que pode melhorar?"

### `js/scriptfamilia.js` (gerado com IA a partir do desenho da equipe)
A ideia, o visual e o comportamento da família de sensores foram **desenhados por Guilherme Enrico (RM575227)**: cada sensor com nome, cor e cômodo, e como eles aparecem e reagem na página.
O código JavaScript desse arquivo foi **gerado pelo Claude Code** a partir desse desenho. A equipe testou o resultado na página e ajustou o que precisava para combinar com o restante do site.

**Prompt usado (resumo):** "Crie em JavaScript puro, sem frameworks, a parte interativa da família de sensores da Grande Família, seguindo este desenho: [descrição dos sensores, cores e comportamento e foto do desenho]."

## Análise crítica
- **Benefícios:** a revisão com IA encontrou erros que a gente não tinha percebido e ajudou a organizar o código. Também foi útil para entender melhor como manipular o DOM.
- **Limitações:** o código gerado pela IA nem sempre encaixa direto no projeto. Foi preciso testar no navegador e ajustar nomes, classes e caminhos.
- **Dificuldades:** entender um código que a gente não escreveu linha por linha leva tempo. Por isso revisamos o `scriptfamilia.js` juntos para conseguir explicar o que ele faz.
- **Decisão da equipe:** o `script.js` foi feito por nós e só revisado pela IA. O `scriptfamilia.js` foi a parte em que a IA teve papel maior, e por isso deixamos isso registrado aqui.

AI MD FEITO por CLAUDE 
