const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setup-roles')
        .setDescription('Despliega el panel estético de gestión de roles.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        const channelId = '1460372642765738268'; 
        const channel = interaction.client.channels.cache.get(channelId);

        if (!channel) return interaction.reply({ content: 'No se pudo localizar el canal.', ephemeral: true });

        const embed = new EmbedBuilder()
            .setAuthor({ 
                name: 'CENTRO DE NOTIFICACIONES', 
                iconURL: interaction.guild.iconURL() 
            })
            .setTitle('〉Configuración de Preferencias')
            .setDescription(
                'Personaliza tu estancia en el servidor activando las notificaciones que deseas recibir. ' +
                'Esto evitará menciones innecesarias y solo te avisaremos de lo que elijas.'
            )
            .addFields(
                { name: '〉 Disponibles', value: 
                    '```\n' +
                    '• Update      • Sorteos\n' +
                    '• Chat Muerto • Ofertas\n' +
                    '• BlackList\n' +
                    '```', inline: false 
                },
                { name: '〉 ¿Cómo funciona?', value: '> Selecciona las opciones en el menú de abajo. Puedes elegir varias a la vez o quitarlas si ya no las quieres.', inline: false }
            )
            .setColor('#2b2d31') 
            .setImage('https://i.pinimg.com/originals/57/b9/e5/57b9e5526b70cecc4558a284330e0c1d.gif') 
            .setFooter({ text: 'Sistema de Gestión Autónoma', iconURL: interaction.client.user.displayAvatarURL() });

        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId('autorole_menu')
            .setPlaceholder('Haz clic aquí para gestionar tus roles...')
            .setMinValues(0) 
            .setMaxValues(5) 
            .addOptions([
                { label: 'Update', value: '1460373287338246392', description: 'Actualizaciones de plugins y versiones.', emoji: '1448307029948108820' },
                { label: 'Sorteos', value: '1460373363431047250', description: 'Notificaciones de eventos y premios.', emoji: '1448307028022919302' },
                { label: 'Chat Muerto', value: '1460373389993709740', description: '¡Ayúdanos a revivir el servidor!', emoji: '1448307031873290240' },
                { label: 'Ofertas', value: '1460373427113300028', description: 'Promociones y descuentos especiales.', emoji: '1448307047409127484' },
                { label: 'BlackList', value: '1460373461452063004', description: 'Información sobre seguridad y baneos.', emoji: '1448307037753835723' }
            ]);

        const row = new ActionRowBuilder().addComponents(selectMenu);

        await channel.send({ embeds: [embed], components: [row] });
        await interaction.reply({ content: 'Panel desplegado con éxito.', ephemeral: true });
    },
};