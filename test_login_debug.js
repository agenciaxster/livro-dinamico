// Script de Debug para Login - Execute no Console do Navegador
// Copie e cole este código no console do navegador (F12) na página do localhost

console.log('🔍 Iniciando debug do login...');

// Função para testar login diretamente
async function debugLogin(email = 'contato@conectell.com.br', password = 'sua_senha_aqui') {
    console.log('📧 Testando login com:', email);
    
    try {
        // Importar o supabase client
        const { createClient } = await import('https://cdn.skypack.dev/@supabase/supabase-js@2');
        
        const supabaseUrl = 'https://udrtuxppnisvbtuzvujr.supabase.co';
        const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVkcnR1eHBwbmlzdmJ0dXp2dWpyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg1NDc1OTUsImV4cCI6MjA3NDEyMzU5NX0.0uafV2-Il96lH4MJgG0hqTPgQBQe2t9ia3jq33h8tKs';
        
        const supabase = createClient(supabaseUrl, supabaseAnonKey);
        
        console.log('🔗 Cliente Supabase criado');
        
        // Passo 1: Tentar login no Supabase Auth
        console.log('🔐 Passo 1: Tentando login no Supabase Auth...');
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email: email,
            password: password
        });
        
        if (authError) {
            console.error('❌ Erro no Supabase Auth:', authError);
            return { success: false, error: authError.message };
        }
        
        console.log('✅ Login no Supabase Auth bem-sucedido:', authData.user.id);
        
        // Passo 2: Buscar dados do usuário na tabela users por auth_user_id
        console.log('👤 Passo 2: Buscando usuário por auth_user_id...');
        let { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('auth_user_id', authData.user.id)
            .single();
        
        if (userError || !userData) {
            console.log('⚠️ Usuário não encontrado por auth_user_id, tentando por email...');
            
            // Passo 3: Buscar por email (fallback)
            const { data: userByEmail, error: emailError } = await supabase
                .from('users')
                .select('*')
                .eq('email', email)
                .single();
            
            if (emailError || !userByEmail) {
                console.error('❌ Usuário não encontrado na tabela users:', emailError);
                return { success: false, error: 'Usuário não encontrado no sistema' };
            }
            
            console.log('✅ Usuário encontrado por email:', userByEmail);
            
            // Passo 4: Atualizar auth_user_id
            console.log('🔄 Passo 4: Atualizando auth_user_id...');
            const { error: updateError } = await supabase
                .from('users')
                .update({ auth_user_id: authData.user.id })
                .eq('id', userByEmail.id);
            
            if (updateError) {
                console.error('❌ Erro ao atualizar auth_user_id:', updateError);
            } else {
                console.log('✅ auth_user_id atualizado com sucesso');
            }
            
            userData = userByEmail;
        } else {
            console.log('✅ Usuário encontrado por auth_user_id:', userData);
        }
        
        // Passo 5: Verificar status do usuário
        console.log('🔍 Passo 5: Verificando status do usuário...');
        if (userData.status !== 'active') {
            console.error('❌ Usuário não está ativo:', userData.status);
            await supabase.auth.signOut();
            return { success: false, error: 'Usuário inativo ou pendente' };
        }
        
        console.log('✅ Usuário está ativo');
        
        // Passo 6: Atualizar último login
        console.log('📅 Passo 6: Atualizando último login...');
        const { error: loginUpdateError } = await supabase
            .from('users')
            .update({ last_login: new Date().toISOString() })
            .eq('id', userData.id);
        
        if (loginUpdateError) {
            console.warn('⚠️ Erro ao atualizar último login:', loginUpdateError);
        } else {
            console.log('✅ Último login atualizado');
        }
        
        // Resultado final
        const finalUser = {
            id: userData.id,
            name: userData.name,
            email: userData.email,
            role: userData.role,
            status: userData.status,
            companyId: userData.company_id,
            isMasterAdmin: userData.is_master_admin,
            avatar: userData.avatar_url,
            phone: userData.phone,
            lastLogin: userData.last_login,
            createdAt: userData.created_at,
            updatedAt: userData.updated_at
        };
        
        console.log('🎉 Login completo bem-sucedido!');
        console.log('👤 Dados do usuário:', finalUser);
        
        return { success: true, user: finalUser };
        
    } catch (error) {
        console.error('💥 Erro geral no login:', error);
        return { success: false, error: error.message };
    }
}

// Função para verificar dados do usuário admin
async function checkAdminUser() {
    console.log('🔍 Verificando dados do usuário admin...');
    
    try {
        const { createClient } = await import('https://cdn.skypack.dev/@supabase/supabase-js@2');
        
        const supabaseUrl = 'https://udrtuxppnisvbtuzvujr.supabase.co';
        const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVkcnR1eHBwbmlzdmJ0dXp2dWpyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg1NDc1OTUsImV4cCI6MjA3NDEyMzU5NX0.0uafV2-Il96lH4MJgG0hqTPgQBQe2t9ia3jq33h8tKs';
        
        const supabase = createClient(supabaseUrl, supabaseAnonKey);
        
        // Verificar na tabela public.users
        const { data: publicUser, error: publicError } = await supabase
            .from('users')
            .select('*')
            .eq('email', 'contato@conectell.com.br')
            .single();
        
        if (publicError) {
            console.error('❌ Erro ao buscar usuário na tabela public.users:', publicError);
            return;
        }
        
        console.log('📋 Dados do usuário na tabela public.users:');
        console.table(publicUser);
        
        // Verificar se existe no auth.users
        if (publicUser.auth_user_id) {
            console.log('🔍 Verificando no auth.users...');
            const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(publicUser.auth_user_id);
            
            if (authError) {
                console.error('❌ Erro ao buscar no auth.users:', authError);
            } else {
                console.log('📋 Dados do usuário no auth.users:');
                console.table(authUser.user);
            }
        } else {
            console.warn('⚠️ auth_user_id não está definido para este usuário');
        }
        
    } catch (error) {
        console.error('💥 Erro ao verificar usuário admin:', error);
    }
}

// Instruções de uso
console.log(`
🚀 INSTRUÇÕES DE USO:

1. Para verificar dados do usuário admin:
   checkAdminUser()

2. Para testar login (substitua 'sua_senha' pela senha real):
   debugLogin('contato@conectell.com.br', 'sua_senha')

3. Para testar com outros dados:
   debugLogin('outro@email.com', 'outra_senha')

Exemplo:
debugLogin('contato@conectell.com.br', 'MinhaSenh@123')
`);

// Auto-executar verificação do usuário admin
checkAdminUser();