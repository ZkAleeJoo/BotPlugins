const { Events } = require('discord.js');

module.exports = {
    name: Events.InteractionCreate,
    once: false,
    async execute(interaction) {
        // --- MANEJO DE COMANDOS ---
        if (interaction.isChatInputCommand()) {
            const command = interaction.client.commands.get(interaction.commandName);
            if (!command) return;
            try { await command.execute(interaction); } catch (e) { console.error(e); }
        }

        // --- SISTEMA DE AUTOROLES ---
        if (interaction.isStringSelectMenu() && interaction.customId === 'autorole_menu') {
            const selectedRoles = interaction.values; 
            const allAutoroles = [
                '1460373287338246392', '1460373363431047250', 
                '1460373389993709740', '1460373427113300028', 
                '1460373461452063004'
            ];

            try {
                const member = interaction.member;
                const currentRoles = member.roles.cache.map(r => r.id);
                
                const otherRoles = currentRoles.filter(id => !allAutoroles.includes(id));
                
                const finalRoles = [...otherRoles, ...selectedRoles];

                await member.roles.set(finalRoles);

                await interaction.reply({ 
                    content: 'Tus preferencias han sido actualizadas con éxito.', 
                    flags: 64
                });
            } catch (error) {
                console.error('Error en Autoroles:', error);
                await interaction.reply({ 
                    content: 'Error de permisos al actualizar tus roles.', 
                    flags: 64
                });
            }
        }

        // --- SISTEMA DE SOPORTE: ABRIR MODAL  ---
        if (interaction.isButton() && interaction.customId === 'open_support_modal') {
            const modal = new ModalBuilder()
                .setCustomId('support_form')
                .setTitle('Formulario de Soporte Técnico');

            const pluginInput = new TextInputBuilder()
                .setCustomId('plugin_name')
                .setLabel("¿Qué plugin presenta el problema?")
                .setStyle(TextInputStyle.Short)
                .setPlaceholder('Ej: MaxStaff, ClearLag+...')
                .setRequired(true);

            const issueInput = new TextInputBuilder()
                .setCustomId('issue_description')
                .setLabel("Describe el error o duda")
                .setStyle(TextInputStyle.Paragraph)
                .setPlaceholder('Explica detalladamente qué sucede...')
                .setRequired(true);

            modal.addComponents(
                new ActionRowBuilder().addComponents(pluginInput),
                new ActionRowBuilder().addComponents(issueInput)
            );

            await interaction.showModal(modal);
        }

        // --- SISTEMA DE SOPORTE ---
        if (interaction.isModalSubmit() && interaction.customId === 'support_form') {
            const plugin = interaction.fields.getTextInputValue('plugin_name');
            const description = interaction.fields.getTextInputValue('issue_description');

            const embed = new EmbedBuilder()
                .setTitle(`Reporte de Soporte: ${plugin}`)
                .setColor('#ff4757')
                .setAuthor({ name: interaction.user.username, iconURL: interaction.user.displayAvatarURL() })
                .addFields(
                    { name: '🔌 Plugin', value: `\`${plugin}\``, inline: true },
                    { name: '👤 Usuario', value: `${interaction.user}`, inline: true },
                    { name: '📝 Descripción', value: description }
                )
                .setTimestamp()
                .setFooter({ text: 'Zenith Support System' });

            try {
                const thread = await interaction.channel.threads.create({
                    name: `Soporte: ${plugin} - ${interaction.user.username}`,
                    autoArchiveDuration: 1440,
                    reason: `Nuevo ticket de soporte de ${interaction.user.username}`,
                });

                await thread.send({ content: `Atención <@${interaction.guild.ownerId}>, hay un nuevo reporte.`, embeds: [embed] });
                await thread.members.add(interaction.user.id);

                await interaction.reply({ 
                    content: `✅ Se ha creado tu hilo de soporte: ${thread}`, 
                    flags: 64 
                });
            } catch (error) {
                console.error('Error al crear el hilo:', error);
                await interaction.reply({ content: 'Hubo un error al crear el hilo de soporte.', flags: 64 });
            }
        }






    },
};