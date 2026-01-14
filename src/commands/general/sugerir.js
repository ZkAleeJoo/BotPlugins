const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('sugerir')
        .setDescription('Envía una sugerencia para mejorar un plugin.')
        .addStringOption(option =>
            option.setName('idea')
                .setDescription('Describe tu idea detalladamente')
                .setRequired(true)),

    async execute(interaction) {
        const idea = interaction.options.getString('idea');
        const channelId = process.env.SUGGESTIONS_CHANNEL_ID;
        const suggestChannel = interaction.client.channels.cache.get(channelId);

        if (!suggestChannel) {
            return interaction.reply({
                content: '❌ **Error:** No se ha configurado el canal de sugerencias.',
                flags: 64
            });
        }

        const embed = new EmbedBuilder()
            .setTitle('💡 Nueva Sugerencia')
            .setDescription(idea)
            .setColor('#f1c40f')
            .setAuthor({ 
                name: interaction.user.username, 
                iconURL: interaction.user.displayAvatarURL() 
            })
            .setTimestamp()
            .setFooter({ text: `ID del Usuario: ${interaction.user.id}` });

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('vote_up')
                .setLabel('A favor')
                .setEmoji('👍')
                .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
                .setCustomId('vote_down')
                .setLabel('En contra')
                .setEmoji('👎')
                .setStyle(ButtonStyle.Danger)
        );

        await suggestChannel.send({ embeds: [embed], components: [row] });

        await interaction.reply({
            content: '✅ ¡Tu sugerencia ha sido enviada al canal correspondiente!',
            flags: 64
        });
    },
};